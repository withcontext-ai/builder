import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createChunkDecoder } from 'ai'
import useSWR from 'swr'

import { ChatContextType, useChatContext } from './chat-context'
import { ChatApp, ChatMessage, EventMessage, Message } from './types'

interface UseChatOptions {
  id?: string
  initialMessages?: Message[]
  initialInput?: string
  onResponse?: (response: Response) => Promise<void> | void
  onFinish?: (message: Message, data: StreamData) => Promise<void> | void
  onError?: (error: Error) => Promise<void> | void
}

type UseChatHelpers = {
  messages: Message[]
  setMessages: (messages: Message[]) => void
  mutateMessage: (id: string, message: Message) => void
  reload: () => void
  error?: Error
  append: (message: Message) => void
  complete: (query: string) => void
  stop: () => void
  isLoading: boolean
  input?: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
} & ChatContextType

interface StreamData {
  id: string
}

const buildUserMessage = (content: string): ChatMessage => ({
  id: '',
  content,
  role: 'user',
  type: 'chat',
  createdAt: new Date(),
})

export function useChat(props?: UseChatOptions): UseChatHelpers {
  const ctx = useChatContext()
  const { app, session, id: contextualId } = ctx
  const {
    id = contextualId,
    initialMessages = [],
    onError,
    onFinish,
    onResponse,
    initialInput,
  } = props ?? {}
  const { short_id: appId } = app || ({} as ChatApp)
  const { short_id: sessionId, api_session_id: apiSessionId } = session
  const { data: messages = [], mutate } = useSWR<Message[]>(id, null, {
    fallbackData: initialMessages,
  })

  const { data: isLoading = false, mutate: mutateLoading } = useSWR<boolean>(
    [id, 'loading'],
    null
  )

  const [error, setError] = useState<undefined | Error>()

  const abortControllerRef = useRef<AbortController | null>(null)

  const messagesRef = useRef<Message[]>(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const chatMessages = useMemo(
    () => messages.filter((m) => m.type === 'chat'),
    [messages]
  )

  const triggerRequest = useCallback(
    async ({ query, reloadId }: { query: string; reloadId?: string }) => {
      try {
        mutateLoading(true)

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        const currMessages = messagesRef.current

        const res = await fetch(`/api/chat/`, {
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
          id: '',
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

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          const chunk = decode(value)

          if (chunk.startsWith('[DATA]')) {
            streamedData = {
              ...streamedData,
              ...JSON.parse(chunk.slice(6)),
            } as StreamData
            continue
          }
          // Update the chat state with the new message tokens.
          streamedResponse += chunk

          responseMessage.content = streamedResponse

          mutate([...currMessages, responseMessage], false)

          // The request has been aborted, stop reading the stream.
          if (abortControllerRef.current === null) {
            reader.cancel()
            break
          }
        }

        responseMessage.id = streamedData.id

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

        setError(err as Error)
        throw err
      } finally {
        mutateLoading(false)
      }
    },
    [
      apiSessionId,
      appId,
      mutate,
      mutateLoading,
      onError,
      onFinish,
      onResponse,
      sessionId,
    ]
  )

  const reload = useCallback(() => {
    if (messagesRef.current.length === 0) {
      return
    }
    const lastMessage = messagesRef.current[messagesRef.current.length - 1]
    if (lastMessage.role !== 'assistant' || lastMessage.type !== 'chat') {
      return
    }
    const currMessages = messagesRef.current
    try {
      triggerRequest({ query: lastMessage.content, reloadId: lastMessage.id })
    } catch (err) {
      mutate(currMessages, false)
    }
  }, [mutate, triggerRequest])

  const complete = useCallback(
    (query: string) => {
      const prevMessages = messagesRef.current
      const nextMessages = [...prevMessages, buildUserMessage(query)]
      messagesRef.current = nextMessages
      mutate(nextMessages, false)
      try {
        triggerRequest({ query })
      } catch (err) {
        mutate(prevMessages, false)
      }
    },
    [mutate, triggerRequest]
  )

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const append = useCallback(
    (message: Message) => {
      mutate([...messagesRef.current, message], false)
    },
    [mutate]
  )

  const setMessages = useCallback(
    (messages: Message[]) => {
      mutate(messages, false)
      messagesRef.current = messages
    },
    [mutate]
  )

  const mutateMessage = useCallback(
    (id: string, message: Message) => {
      const currMessages = messagesRef.current
      const index = currMessages.findIndex((m) => m.id === id)
      if (index === -1) {
        return
      }
      currMessages[index] = message
      mutate([...currMessages], false)
    },
    [mutate]
  )

  // Input state and handlers.
  const { data: input, mutate: setInput } = useSWR([id, 'input'], null, {
    fallbackData: initialInput,
  })

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input) return

      complete(input)
      setInput('', false)
    },
    [input, complete, setInput]
  )

  const handleInputChange = (e: any) => {
    setInput(e.target.value, false)
  }

  return {
    messages,
    setMessages,
    reload,
    stop,
    error,
    append,
    isLoading,
    complete,
    mutateMessage,
    input,
    handleInputChange,
    handleSubmit,
    ...ctx,
  }
}
