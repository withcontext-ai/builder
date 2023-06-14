'use client'

import { ChatMessage, useChatStore } from '@/store/chat'

import ChatCard, { IMessage } from './chat-card'
import { useScrollToBottom } from './utils'

const ChatList = () => {
  const model_avatar = 'https://github.com/withcontext-ai.png'
  const user_avatar = 'https://github.com/withcontext-ai.png'
  const chatStore = useChatStore()
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom()

  return (
    <div
      className="flex flex-1 flex-col gap-12 overflow-auto p-6"
      ref={scrollRef}
      onTouchStart={() => {
        setAutoScroll(false)
      }}
    >
      {chatStore?.messages?.map((message: ChatMessage) => {
        return (
          <ChatCard
            message={message}
            key={message?.content}
            model_avatar={model_avatar}
            user_avatar={user_avatar}
          />
        )
      })}
    </div>
  )
}

export default ChatList
