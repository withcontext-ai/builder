'use client'

import { ChatMessage, useChatStore } from '@/store/chat'

import { useScrollToBottom } from '@/hooks/useScrollToBottom'

import ChatCard from './chat-card'

const ChatList = () => {
  const model_avatar = 'https://github.com/withcontext-ai.png'
  const user_avatar = 'https://github.com/shadcn.png'
  const [session] = useChatStore((state) => [state?.currentSession()])
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom()
  return (
    <div
      className="flex flex-1 flex-col gap-12 overflow-auto p-6"
      ref={scrollRef}
      onTouchStart={() => {
        setAutoScroll(false)
      }}
    >
      {session?.messages?.map((message: ChatMessage, index: number) => {
        const isEnd = session?.messages?.length - 1 === index
        return (
          <ChatCard
            message={message}
            key={message?.id}
            model_avatar={model_avatar}
            user_avatar={user_avatar}
            isEnd={isEnd}
          />
        )
      })}
    </div>
  )
}

export default ChatList
