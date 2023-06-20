'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/store/chat'
import { useChat } from 'ai/react'

import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import ChatList from './chat-list'

interface IProps {
  sessionId: string
}

const Chat = ({ sessionId }: IProps) => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id: sessionId,
  })

  // const chatStore = useChatStore()

  // useEffect(() => {
  //   chatStore.setChatId(chat_id)
  //   chatStore.addNewSession(chat_id)
  // }, [])

  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader />
      <ChatList messages={messages} />
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}

export default Chat
