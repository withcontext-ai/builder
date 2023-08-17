'use client'

import { useMemo } from 'react'
import { useChat } from 'ai/react'

import { useScrollToBottom } from '@/hooks/useScrollToBottom'
import { ChatContextProvider, ChatMode } from '@/components/chat/chat-context'
import ChatHeader from '@/components/chat/chat-header'
import ChatInput from '@/components/chat/chat-input'
import ChatList from '@/components/chat/chat-list'

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

const app = {
  name: 'chat-app',
  short_id: '',
  icon: '',
  opening_remarks: '',
  enable_video_interaction: false,
}
const session = { api_session_id: '', name: 'test-chat-session', short_id: '' }

const TestChat = () => {
  const {
    messages,
    input,
    isLoading,
    reload,
    stop,
    handleSubmit,
    handleInputChange,
  } = useChat({
    id: 'test-chat',
    body: {
      appId: 'YhTq4Xx29aDZ',
      sessionId: 'srQuAKvgZR7W',
      apiSessionId: '21486acbbd393f8a6131a9009d6aae4d',
    },
  })

  const { scrollRef, setAutoScroll } = useScrollToBottom()
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e)
    setAutoScroll(true)
  }
  const showResend = useMemo(() => messages?.length > 0, [messages])
  const chatMessages = useMemo(() => {
    const formattedMessages = messages?.map((message) => ({
      type: 'chat',
      data: message,
    }))
    return [...formattedMessages].sort(
      (a, b) =>
        formatToTimestamp(a.data?.createdAt) -
        formatToTimestamp(b.data?.createdAt)
    )
  }, [messages])

  return (
    <ChatContextProvider
      app={app}
      session={session}
      mode="live"
      isLoading={isLoading}
    >
      <div className="relative h-full w-full">
        <div className="flex h-full w-full flex-col">
          <ChatHeader />
          <ChatList
            messages={chatMessages}
            scrollRef={scrollRef}
            setAutoScroll={setAutoScroll}
          />
          <ChatInput
            input={input}
            onSubmit={onSubmit}
            stop={stop}
            showResend={showResend}
            handleInputChange={handleInputChange}
            reload={reload}
          />
        </div>
      </div>
    </ChatContextProvider>
  )
}

export default TestChat
