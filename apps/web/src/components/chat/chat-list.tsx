'use client'

import { Ref } from 'react'
import { Message } from 'ai'

import { useScrollToBottom } from '@/hooks/useScrollToBottom'

import ChatCard from './chat-card'

interface IProps {
  messages: Message[]
  waiting: boolean
  scrollRef: Ref<HTMLDivElement>
  setAutoScroll: (s: boolean) => void
}

const ChatList = ({ messages, waiting, scrollRef, setAutoScroll }: IProps) => {
  const model_avatar = 'https://github.com/withcontext-ai.png'
  const user_avatar = 'https://github.com/shadcn.png'
  return (
    <div
      className="flex flex-1 flex-col gap-12 overflow-auto px-6 pb-24 pt-6"
      ref={scrollRef}
      onWheel={() => setAutoScroll(false)}
    >
      {messages?.map((message: Message, index: number) => {
        return (
          <ChatCard
            message={message}
            key={message?.id}
            model_avatar={model_avatar}
            user_avatar={user_avatar}
          />
        )
      })}
      {waiting && (
        <ChatCard message={{ id: '', content: '', role: 'assistant' }} />
      )}
    </div>
  )
}

export default ChatList
