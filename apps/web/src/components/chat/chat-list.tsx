'use client'

import { useChatStore } from '@/store/chat'

import ChatCard, { IMessage } from './chat-card'

const ChatList = () => {
  const model_avatar = 'https://github.com/withcontext-ai.png'
  const user_avatar = 'https://github.com/withcontext-ai.png'
  const chatStore = useChatStore()
  return (
    <div className="flex flex-1 flex-col gap-12 overflow-auto p-6">
      {chatStore?.messages?.map((message: any) => {
        return (
          <ChatCard
            message={message}
            key={message?.text}
            model_avatar={model_avatar}
            user_avatar={user_avatar}
          />
        )
      })}
    </div>
  )
}

export default ChatList
