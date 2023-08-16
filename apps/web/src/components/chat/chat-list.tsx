'use client'

import { Ref } from 'react'
import { Message } from 'ai'

import { cn } from '@/lib/utils'

import ChatCard from './chat-card'
import { useChatContext } from './chat-context'
import { ChatFeedbackContextProvider } from './feedback/chat-feedback-context'
import ChatFeedbackDialog from './feedback/chat-feedback-dialog'

interface IProps {
  messages: any[]
  error?: string
  scrollRef: Ref<HTMLDivElement>
  setAutoScroll: (s: boolean) => void
}

const ChatList = ({ messages, scrollRef, setAutoScroll, error }: IProps) => {
  const { mode, isLoading } = useChatContext()
  const isDebug = mode === 'debug'

  return (
    <div
      className={cn(
        'flex flex-1 flex-col gap-12 overflow-auto px-6 pb-24 pt-6 scrollbar-none',
        isDebug && 'px-0'
      )}
      ref={scrollRef}
      onWheel={() => setAutoScroll(false)}
    >
      <ChatFeedbackContextProvider>
        {messages?.map((message: any, index: number) => {
          return (
            <ChatCard
              message={message}
              key={message?.data?.id}
              error={error}
              isEnd={index === messages.length - 1}
            />
          )
        })}
        <ChatFeedbackDialog />
      </ChatFeedbackContextProvider>
      {isLoading && messages[messages.length - 1]?.data?.role === 'user' && (
        <ChatCard message={{ id: '', content: '', role: 'assistant' }} />
      )}
    </div>
  )
}

export default ChatList
