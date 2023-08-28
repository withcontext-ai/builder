'use client'

import { createContext, PropsWithChildren, useContext } from 'react'

import { ChatApp, ChatSession, ChatUser } from './types'

export type ChatMode = 'live' | 'debug' | 'history'

interface BaseChatContextType {
  app?: ChatApp | null
  session: ChatSession
  user?: ChatUser | null
  mode: ChatMode
  isLoading?: boolean
  showProcess?: boolean
  setShowProcess?: (s: boolean) => void
}

interface LiveChatContextType extends BaseChatContextType {
  mode: 'live'
  isLoading: boolean
}

interface DebugChatContextType extends BaseChatContextType {
  mode: 'debug'
  isLoading: boolean
}

interface HistoryChatContextType extends BaseChatContextType {
  mode: 'history'
}

type ChatContextType =
  | LiveChatContextType
  | DebugChatContextType
  | HistoryChatContextType

const ChatContext = createContext<ChatContextType>({} as ChatContextType)

const ChatContextProvider = ({
  children,
  ...props
}: PropsWithChildren<ChatContextType>) => (
  <ChatContext.Provider value={props}>{children}</ChatContext.Provider>
)

const useChatContext = () => useContext(ChatContext)

export { ChatContext, ChatContextProvider, useChatContext }
