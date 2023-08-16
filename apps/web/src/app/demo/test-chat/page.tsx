import { useMemo } from 'react'
import { useChat } from 'ai/react'

import { useScrollToBottom } from '@/hooks/useScrollToBottom'
import { ChatContextProvider } from '@/components/chat/chat-context'
import ChatHeader from '@/components/chat/chat-header'
import ChatInput from '@/components/chat/chat-input'
import ChatList from '@/components/chat/chat-list'

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
    input,
    isLoading,
    messages,
    stop,
    handleSubmit,
    handleInputChange,
    reload,
  } = useChat({
    id: 'test-chat',
    body: {
      appId: 'test-chat-app',
      sessionId: 'test-chat',
      // apiSessionId,
    },
  })
  const { scrollRef, setAutoScroll } = useScrollToBottom()
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e)
    setAutoScroll(true)
  }
  const showResend = useMemo(() => messages?.length > 0, [messages])

  return (
    <ChatContextProvider
      app={app}
      session={session}
      mode="live"
      isLoading={isLoading}
    >
      <div className="relative h-full w-full">
        <div className="flex h-full w-full flex-col">
          <div data-testid="chat-header" className="w-full">
            <ChatHeader />
          </div>
          <div data-testid="chat-list" className="w-full">
            <ChatList
              messages={messages}
              scrollRef={scrollRef}
              setAutoScroll={setAutoScroll}
            />
          </div>
          <div className="w-full" data-testid="chat-input">
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
      </div>
    </ChatContextProvider>
  )
}

export default TestChat
