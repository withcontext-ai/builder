'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useModal } from '@ebay/nice-modal-react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import { fetcher, nanoid } from '@/lib/utils'
import usePageTitle from '@/hooks/use-page-title'
import useSubscribe from '@/hooks/use-subscribe'
import { useScrollToBottom } from '@/hooks/useScrollToBottom'

import { ChatContextProvider, ChatMode } from './chat-context'
import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import ChatList from './chat-list'
import ChatProcess from './chat-process'
import RestartConfirmPage from './restart-confirm'
import {
  ChatApp,
  ChatMessage,
  ChatSession,
  ChatUser,
  EventMessage,
  ProcessTask,
} from './types'
import useConfigBase64 from './use-config-base64'
import { useChat } from './useChat'
import { checkIfWorkflowHasEnabledVideoInteracion } from './utils'
import VideoCallConfirmDialog from './video-call-confirm-dialog'

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

function eventMessageBuilder(type: string): EventMessage {
  return {
    type: 'event',
    id: nanoid(),
    createdAt: new Date(),
    eventType: type,
    role: 'assistant',
  }
}

function addEvent(
  url: string,
  { arg }: { arg: { session_id: string; event: EventMessage } }
) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

interface BaseChatProps {
  session: ChatSession
  app: ChatApp | null
  user?: ChatUser | null
  mode: ChatMode
  initialMessages?: ChatMessage[]
  initialEvents?: EventMessage[]
  api?: string
}

interface DebugChatProps extends BaseChatProps {
  mode: 'debug'
  isConfigChanged?: boolean
  saveMessages?: (messages: ChatMessage[]) => void
  onRestart?: () => void
}

interface LiveChatProps extends BaseChatProps {
  mode: 'live'
  workflow: ProcessTask[]
}

export type ChatProps = LiveChatProps | DebugChatProps

const createInputMessage = (input: string = '') => {
  const inputMsg: ChatMessage = {
    id: nanoid(),
    content: input,
    createdAt: new Date(),
    role: 'user',
    type: 'chat',
  }
  return inputMsg
}

const WrappedChat = (props: ChatProps) => {
  const { app, session, mode, initialMessages = [] } = props
  const appName = app?.name || ''
  const {
    short_id: sessionId,
    name: sessionName,
    api_session_id: apiSessionId,
  } = session

  const isDebug = mode === 'debug'
  const [confirmReset, setConfirmReset] = useState(
    isDebug && props.isConfigChanged && initialMessages?.length !== 0
  )
  const [showProcess, setShowProcess] = useState(false)

  const { scrollRef, setAutoScroll } = useScrollToBottom()
  const { mutate } = useSWRConfig()

  const {
    messages,
    input,
    stop,
    error,
    setMessages,
    events,
    setEvents,
    submit,
    reload,
  } = useChat({
    id: sessionId,
    onFinish: (message) => {
      // save message to local storage at debug mode
      if (isDebug && currentInput?.current && !!message.content) {
        props?.saveMessages?.([...messages, currentInput.current, message])
      }
      // check chat process at live mode
      if (mode === 'live') {
        mutate(`/api/chat/process?api_session_id=${apiSessionId}`)
      }
    },
  })

  const callLinkRef = useRef('')
  const configStr = useConfigBase64({ appName })

  const currentInput = useRef<ChatMessage>()

  const chatMessages = useMemo(() => {
    return [...messages, ...events].sort(
      (a, b) => formatToTimestamp(a.createdAt) - formatToTimestamp(b.createdAt)
    )
  }, [messages, events])

  const onReload = () => {
    reload()
    setAutoScroll(true)
  }

  const showResend = useMemo(() => messages?.length > 0, [messages])

  usePageTitle(sessionName)

  const handleRestartConfirm = () => {
    handleRestart()
    setConfirmReset(false)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    submit(e)
    setAutoScroll(true)
    if (isDebug) {
      currentInput.current = createInputMessage(input)
    }
  }

  const disabledRestart =
    messages.length === 0 ||
    ((app?.opening_remarks && messages?.length == 1) as boolean)

  const modal = useModal(VideoCallConfirmDialog)
  const closeModal = useCallback(() => {
    modal.hide()
    setTimeout(() => {
      modal.remove()
    }, 200)
  }, [modal])

  const handleAccept = useCallback(() => {
    window.open(callLinkRef.current, '_blank')
    closeModal()
  }, [closeModal])

  const { trigger: addEventTrigger } = useSWRMutation(
    `/api/chat/event`,
    addEvent
  )

  const handleDecline = useCallback(() => {
    const message = eventMessageBuilder('call.declined')
    setEvents((prev) => [...prev, message])
    addEventTrigger({ session_id: sessionId, event: message })
    closeModal()
  }, [setEvents, addEventTrigger, sessionId, closeModal])

  const handleCancel = useCallback(() => {
    const message = eventMessageBuilder('call.canceled')
    setEvents((prev) => [...prev, message])
    addEventTrigger({ session_id: sessionId, event: message })
    closeModal()
  }, [setEvents, addEventTrigger, sessionId, closeModal])

  const openModal = useCallback(() => {
    modal.show({
      appId: app?.short_id ?? '',
      appIcon: app?.icon ?? '',
      appName: app?.name ?? '',
      onAccept: handleAccept,
      onDecline: handleDecline,
      onCancel: handleCancel,
    })
  }, [modal, app, handleAccept, handleDecline, handleCancel])

  const handleRestart = () => {
    stop()
    setMessages([])
    if (isDebug) {
      props?.onRestart?.()
    }
  }

  const onAdd = useCallback(
    (newEventMessage: any) => {
      if (newEventMessage?.eventType === 'call.created') {
        callLinkRef.current = `${newEventMessage?.link || ''}${
          configStr ? `?c=${configStr}` : ''
        }`
        openModal()
        return
      }
      setEvents((prev) => [...prev, newEventMessage])
    },
    [setEvents, configStr, openModal]
  )
  useSubscribe({
    channelId: `session-${sessionId}`,
    eventName: 'user-chat',
    onAdd,
    enabled:
      mode === 'live' &&
      !!apiSessionId &&
      checkIfWorkflowHasEnabledVideoInteracion(app as any),
  })

  return (
    <>
      <div className="relative h-full w-full">
        {confirmReset && (
          <RestartConfirmPage
            onRestart={handleRestartConfirm}
            onCancel={() => setConfirmReset(false)}
          />
        )}
        <div className="flex h-full w-full flex-col">
          <ChatHeader
            onRestart={handleRestart}
            disabledRestart={disabledRestart}
            showProcess={showProcess}
            setShowProcess={setShowProcess}
          />
          <div className="flex h-0 flex-1">
            <div className="flex flex-1 flex-col">
              <ChatList
                messages={chatMessages}
                scrollRef={scrollRef}
                error={error?.message}
                setAutoScroll={setAutoScroll}
              />
              <ChatInput
                onSubmit={onSubmit}
                showResend={showResend}
                onReload={onReload}
                onStop={stop}
              />
            </div>
            {mode === 'live' && showProcess && (
              <div className="w-[380px] border-l">
                <ChatProcess workflow={props.workflow} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

const Chat = (props: ChatProps) => {
  const { app, session, user, mode, initialEvents, initialMessages, api } =
    props
  return (
    <ChatContextProvider
      app={app}
      session={session}
      user={user}
      mode={mode}
      initialEvents={initialEvents}
      initialMessages={initialMessages}
      api={api}
    >
      <WrappedChat {...props} />
    </ChatContextProvider>
  )
}

export default Chat
