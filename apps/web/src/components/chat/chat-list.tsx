'use client'

import { ChatMessage, useChatStore } from '@/store/chat'

import ChatCard from './chat-card'
import { useScrollToBottom } from './utils'

const ChatList = () => {
  const model_avatar = 'https://github.com/withcontext-ai.png'
  const user_avatar = 'https://github.com/shadcn.png'
  const chatStore = useChatStore()
  const { messages } = chatStore
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom()
  return (
    <div
      className="flex flex-1 flex-col gap-12 overflow-auto p-6"
      ref={scrollRef}
      onTouchStart={() => {
        setAutoScroll(false)
      }}
    >
      {messages?.map((message: ChatMessage, index: number) => {
        const isEnd = messages?.length - 1 === index
        return (
          <ChatCard
            message={message}
            key={message?.content}
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
