'use client'

import { useScrollToBottom } from '@/hooks/useScrollToBottom'

import ChatCard from './chat-card'
import { Message } from './type'

interface IProps {
  messages: Message[]
  isLoading: boolean
}

const ChatList = ({ messages, isLoading }: IProps) => {
  const model_avatar = 'https://github.com/withcontext-ai.png'
  const user_avatar = 'https://github.com/shadcn.png'
  const { scrollRef, setAutoScroll } = useScrollToBottom()
  return (
    <div
      className="flex flex-1 flex-col gap-12 overflow-auto p-6"
      ref={scrollRef}
      onTouchStart={() => {
        setAutoScroll(false)
      }}
    >
      {messages?.map((message: Message, index: number) => {
        const isEnd = messages?.length - 1 === index
        return (
          <ChatCard
            message={message}
            key={message?.id}
            model_avatar={model_avatar}
            user_avatar={user_avatar}
            isEnd={isEnd}
            isLoading={isLoading}
          />
        )
      })}
    </div>
  )
}

export default ChatList
