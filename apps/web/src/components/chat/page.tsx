'use client'

import { useChatStore } from '@/store/chat'
import { useChat } from 'ai/react'
import { findLastIndex } from 'lodash'

import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import ChatList from './chat-list'

interface IProps {
  sessionId: string
}

const Chat = ({ sessionId }: IProps) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    stop,
  } = useChat({
    id: sessionId,
  })

  const findIndex = () => {
    const hasResponse = messages?.filter(
      (item) => item?.role === 'assistant' && item?.content
    )
    if (hasResponse?.length) {
      const index = findLastIndex(messages, (item) => item?.role === 'user')
      return index
    }
    return -1
  }

  const showResend = findIndex() !== -1
  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader />
      <ChatList messages={messages} />
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        showResend={showResend}
        reload={reload}
        stop={stop}
      />
    </div>
  )
}

export default Chat
