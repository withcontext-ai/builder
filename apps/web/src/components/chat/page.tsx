'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/store/chat'

import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import ChatList from './chat-list'

const Chat = ({ chat_id }: { chat_id: string }) => {
  const chatStore = useChatStore()
  useEffect(() => {
    chatStore.setChatId(chat_id)
    chatStore.addNewSession(chat_id)
  }, [chat_id])
  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader />
      <ChatList />
      <ChatInput />
    </div>
  )
}

export default Chat
