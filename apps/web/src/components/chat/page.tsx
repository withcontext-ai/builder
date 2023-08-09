'use client'

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Message } from 'ai'
import { useChat } from 'ai/react'

import { nanoid } from '@/lib/utils'
import usePageTitle from '@/hooks/use-page-title'
import useSubscribe from '@/hooks/use-subscribe'
import { useScrollToBottom } from '@/hooks/useScrollToBottom'

import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import ChatList from './chat-list'
import RestartConfirmPage from './restart-confirm'
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

export interface ChatProps {
  sessionId: string
  sessionName: string
  appId: string
  appName: string
  appIcon: string
  isDebug?: boolean
  apiSessionId?: string | null
  initialMessages?: Message[]
  setInitialMessages?: (messages: Message[]) => void
  isConfigChanged?: boolean
}

const Chat = ({
  sessionId,
  sessionName,
  appName,
  appIcon,
  appId,
  isDebug = false,
  apiSessionId,
  initialMessages = [],
  setInitialMessages,
  isConfigChanged,
}: ChatProps) => {
  const [waiting, setWaiting] = useState<boolean>(false)
  const [confirmReset, setConfirmReset] = useState(
    isConfigChanged && initialMessages?.length !== 0
  )
  const { scrollRef, setAutoScroll } = useScrollToBottom()

  const {
    messages,
    input,
    setInput,
    isLoading,
    reload,
    stop,
    append,
    error,
    setMessages,
  } = useChat({
    id: sessionId,
    initialMessages,
    onResponse: () => {
      setWaiting(false)
    },
    body: {
      sessionId,
      apiSessionId,
    },
    sendExtraMessageFields: true,
  })

  const [eventMessages, setEventMessages] = useState<EventMessage[]>([])
  const [isOpenCallConfirm, setIsOpenCallConfirm] = useState(false)
  const callLinkRef = useRef()
  const onAdd = useCallback(
    (newEventMessage: any) => {
      setEventMessages((prev) => [...prev, newEventMessage])
      if (newEventMessage?.data?.type === 'call.created') {
        callLinkRef.current = newEventMessage?.data?.link
        setIsOpenCallConfirm(true)
      }
    },
    [setEventMessages]
  )
  useSubscribe({
    channelId: `session-${sessionId}`,
    eventName: 'user-chat',
    onAdd,
    enabled: true, // TODO: enable_video_interaction
  })

  const chatMessages = useMemo(() => {
    const formattedMessages = messages?.map((message) => ({
      type: 'chat',
      data: message,
    }))
    return [...formattedMessages, ...eventMessages].sort(
      (a, b) =>
        formatToTimestamp(a.data?.createdAt) -
        formatToTimestamp(b.data?.createdAt)
    )
  }, [messages, eventMessages])

  const handelReload = () => {
    setAutoScroll(true)
    reload()
    setWaiting(true)
  }

  const handelStop = () => {
    setWaiting(false)
    stop()
  }

  const showResend = useMemo(() => messages?.length > 0, [messages])

  usePageTitle(sessionName)

  const onRestart = () => {
    handelStop()
    setMessages([])
    setConfirmReset(false)
  }

  const onCancel = () => {
    setConfirmReset(false)
  }

  useEffect(() => {
    if (isDebug && setInitialMessages) setInitialMessages(messages)
  }, [messages, isDebug, setInitialMessages])

  const disabledRestart = !messages || messages.length === 0

  return (
    <>
      <div className="relative h-full w-full">
        {confirmReset && (
          <RestartConfirmPage onRestart={onRestart} onCancel={onCancel} />
        )}
        <div className="flex h-full w-full flex-col">
          <ChatHeader
            name={sessionName}
            isDebug={isDebug}
            onRestart={() => {
              handelStop()
              setMessages([])
            }}
            disabledRestart={disabledRestart}
          />
          <ChatList
            messages={chatMessages}
            waiting={waiting}
            scrollRef={scrollRef}
            error={error?.message}
            setAutoScroll={setAutoScroll}
            appId={appId}
            appName={appName}
            appIcon={appIcon}
            isDebug={isDebug}
          />
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={async (value) => {
              setAutoScroll(true)
              setWaiting(true)
              await append({
                id: nanoid(),
                content: value,
                role: 'user',
                createdAt: new Date(),
              })
            }}
            isLoading={isLoading}
            showResend={showResend}
            reload={handelReload}
            stop={handelStop}
            isDebug={isDebug}
          />
        </div>
      </div>
      <VideoCallConfirmDialog
        open={isOpenCallConfirm}
        onOpenChange={setIsOpenCallConfirm}
        appId={appId}
        appName={appName}
        appIcon={appIcon}
        onAccept={() => {
          window.open(callLinkRef.current, '_blank')
          setIsOpenCallConfirm(false)
        }}
        onDecline={() => {
          const message: EventMessage = {
            type: 'event',
            data: {
              id: nanoid(),
              type: 'call.declined',
              createdAt: Date.now(),
            },
          }
          setEventMessages((prev) => [...prev, message])
          setIsOpenCallConfirm(false)
        }}
      />
    </>
  )
}

export default Chat
