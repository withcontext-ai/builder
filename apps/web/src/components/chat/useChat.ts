import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { createChunkDecoder, nanoid } from 'ai'
import useSWR from 'swr'

import { ChatContextType, useChatContext } from './chat-context'
import { ChatApp, ChatMessage, EventMessage, Message } from './types'

interface UseChatOptions {
  id?: string
  initialInput?: string
  onResponse?: (response: Response) => Promise<void> | void
  onFinish?: (message: ChatMessage, data: StreamData) => Promise<void> | void
  onError?: (error: Error) => Promise<void> | void
}

type UseChatHelpers = {
  // all messages for display
  allMessages: Message[]

  // chat messages
  messages: ChatMessage[]
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>
  updateMessage: (id: string, message: ChatMessage) => void
  loading: boolean
  error?: Error
  reload: () => void
  append: (message: ChatMessage) => void
  complete: (query: string) => void
  stop: () => void

  // events
  events: EventMessage[]
  setEvents: Dispatch<SetStateAction<EventMessage[]>>

  // input
  input?: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  submit: (e: React.FormEvent<HTMLFormElement>) => void
} & ChatContextType

interface StreamData {
  id: string
  error: string
}

const buildUserMessage = (content: string): ChatMessage => ({
  id: nanoid(),
  content,
  role: 'user',
  type: 'chat',
  createdAt: new Date(),
})

function formatToTimestamp(date?: Date | number | null) {
  if (!date) return 0
  if (Object.prototype.toString.call(date) === '[object Date]') {
    return new Date(date).getTime()
  }
  if (typeof date === 'number') {
    return date
  }
  return 0
}

export function useChat(props?: UseChatOptions): UseChatHelpers {
  const ctx = useChatContext()
  const {
    app,
    session,
    _setError,
    _setLoading,
    loading,
    messages,
    setMessages: _setMessages,
    error,
    events,
    setEvents,
  } = ctx
  const { onError, onFinish, onResponse, initialInput } = props ?? {}
  const { short_id: appId } = app || ({} as ChatApp)
  const { short_id: sessionId, api_session_id: apiSessionId } = session

  const id = `chat/${session.short_id}`

  const abortControllerRef = useRef<AbortController | null>(null)

  const messagesRef = useRef<ChatMessage[]>(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const allMessages = useMemo(
    () =>
      [...messages, ...events].sort(
        (a, b) =>
          formatToTimestamp(a.createdAt) - formatToTimestamp(b.createdAt)
      ),
    [messages, events]
  )

  const setMessages = useCallback(
    (m: ChatMessage[] | ((m: ChatMessage[]) => ChatMessage[])) => {
      const messages = typeof m === 'function' ? m(messagesRef.current) : m
      _setMessages(messages)
      messagesRef.current = messages
    },
    [_setMessages]
  )

  const triggerRequest = useCallback(
    async ({ query, reloadId }: { query: string; reloadId?: string }) => {
      try {
        _setLoading(true)

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        const currMessages = messagesRef.current

        const res = await fetch(`/api/chat`, {
          method: 'POST',
          body: JSON.stringify({
            query,
            reloadId,
            appId,
            sessionId,
            apiSessionId,
          }),
          signal: abortController.signal,
        })

        await onResponse?.(res)

        const responseMessage: ChatMessage = {
          id: nanoid(),
          content: '',
          role: 'assistant',
          type: 'chat',
          createdAt: new Date(),
        }

        if (!res.ok) {
          throw new Error(
            (await res.text()) || 'Failed to fetch the chat response.'
          )
        }

        if (!res.body) {
          throw new Error('The response body is empty.')
        }

        let streamedResponse = ''
        let streamedData = {} as StreamData

        const reader = res.body.getReader()
        const decode = createChunkDecoder()

        // h/t: vercel divide `[DATA]{"error":"error message"}[DATAEND]` into two chunks
        let chunkGroup = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          let chunk = decode(value) as string
          console.log('=== chunk:', chunk)
          chunkGroup += chunk
          console.log('=== chunkGroup 0:', chunkGroup)
          if (chunk.startsWith('[DATA]') && !chunk.endsWith('[DATAEND]')) {
            continue
          }
          console.log('=== chunkGroup 1:', chunkGroup)
          const matches = chunkGroup.match(/\[DATA\](.*)\[DATAEND\]/)
          console.log('=== matches:', matches)
          if (matches?.[1]) {
            streamedData = {
              ...streamedData,
              ...JSON.parse(matches[1]),
            } as StreamData
            chunk = chunkGroup.replace(matches[0], '')
          }
          chunkGroup = ''
          console.log('=== chunk:', chunk)
          console.log('=== streamedData:', streamedData)
          if (streamedData.id) {
            responseMessage.id = streamedData.id
          }

          if (streamedData.error) {
            _setError(new Error(streamedData.error))
          }

          // Update the chat state with the new message tokens.
          streamedResponse += chunk

          responseMessage.content = streamedResponse
          console.log('=== responseMessage:', responseMessage)
          setMessages([...currMessages, { ...responseMessage }])

          // The request has been aborted, stop reading the stream.
          if (abortControllerRef.current === null) {
            reader.cancel()
            break
          }
        }

        if (onFinish) {
          onFinish(responseMessage, streamedData)
        }

        abortControllerRef.current = null
        return
      } catch (err) {
        if ((err as any).name === 'AbortError') {
          abortControllerRef.current = null
          return null
        }

        if (onError && err instanceof Error) {
          onError(err)
        }

        _setError(err as Error)
        throw err
      } finally {
        _setLoading(false)
      }
    },
    [
      _setError,
      _setLoading,
      apiSessionId,
      appId,
      onError,
      onFinish,
      onResponse,
      sessionId,
      setMessages,
    ]
  )

  const reload = useCallback(() => {
    if (messagesRef.current.length === 0) {
      return
    }
    const lastMessage = messagesRef.current[messagesRef.current.length - 1]
    if (lastMessage.type !== 'chat') {
      return
    }
    _setError()

    let query = ''
    let reloadId
    if (lastMessage.role === 'assistant') {
      messagesRef.current = messagesRef.current.slice(0, -1)
      setMessages(messagesRef.current)
      query = messagesRef.current[messagesRef.current.length - 1].content
      reloadId = lastMessage.id
    } else {
      query = lastMessage.content
    }

    const currMessages = messagesRef.current
    try {
      triggerRequest({ query: lastMessage.content, reloadId })
    } catch (err) {
      setMessages(currMessages)
    }
  }, [_setError, setMessages, triggerRequest])

  const complete = useCallback(
    (query: string) => {
      const prevMessages = messagesRef.current
      const nextMessages = [...prevMessages, buildUserMessage(query)]
      messagesRef.current = nextMessages
      setMessages(nextMessages)
      try {
        triggerRequest({ query })
      } catch (err) {}
    },
    [setMessages, triggerRequest]
  )

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const append = useCallback(
    (message: ChatMessage) => {
      setMessages([...messagesRef.current, message])
    },
    [setMessages]
  )

  const updateMessage = useCallback(
    (id: string, message: ChatMessage) => {
      const currMessages = messagesRef.current
      const index = currMessages.findIndex((m) => m.id === id)
      if (index === -1) {
        return
      }
      currMessages[index] = message
      setMessages([...currMessages])
    },
    [setMessages]
  )

  // Input state and handlers.
  const { data: input, mutate: setInput } = useSWR([id, 'input'], null, {
    fallbackData: initialInput,
  })

  const submit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input) return

      complete(input)
      setInput('')
    },
    [input, complete, setInput]
  )

  const handleInputChange = (e: any) => {
    setInput(e.target.value)
  }

  return {
    ...ctx,
    messages,
    setMessages,
    reload,
    stop,
    error,
    append,
    complete,
    updateMessage,
    input,
    handleInputChange,
    submit,
    events,
    setEvents,
    loading,
    allMessages,
  }
}
