import { Message } from 'ai'
import { MessagesSquare } from 'lucide-react'
import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ChatMessage } from '@/components/chat/types'

export function createMessage(): Message {
  return {
    id: nanoid(),
    createdAt: new Date(),
    role: 'user',
    content: '',
  }
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  lastUpdate: number
}

function createEmptySession(id: string, messages?: ChatMessage[]): ChatSession {
  return {
    id,
    messages: messages || [],
    lastUpdate: Date.now(),
  }
}

interface ChatStore {
  sessions: ChatSession[]
  currentSessionId: string
  selectSession: (index: string) => void
  newSession: (id: string, message?: ChatMessage[]) => void
  removeSession: (id: string) => void
  clearAllData: () => void

  currentSession: () => ChatSession
  onNewMessage: (message: ChatMessage[]) => void
  updateCurrentSession: (updater: (session: ChatSession) => void) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: '',

      selectSession(id: string) {
        set({
          currentSessionId: id,
        })
      },

      newSession(id: string, messages?: ChatMessage[]) {
        const session = createEmptySession(id, messages)
        set((state) => ({
          currentSessionId: id,
          sessions: [session].concat(state.sessions),
        }))
      },

      removeSession(id: string) {
        const sessions = get().sessions
        const index = sessions.findIndex((item) => item?.id === id)
        sessions.splice(index, 1)
      },

      currentSession() {
        let id = get().currentSessionId
        const sessions = get().sessions
        const session = sessions?.find((item) => item?.id === id) as ChatSession
        return session
      },

      onNewMessage(message) {
        get().updateCurrentSession((session) => {
          session.messages = message
          session.lastUpdate = Date.now()
        })
      },

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = []
        })
      },

      updateCurrentSession(updater) {
        const sessions = get().sessions
        const id = get().currentSessionId
        const index = sessions?.findIndex((item) => item?.id === id)
        updater(sessions[index])
        set(() => ({ sessions }))
      },

      clearAllData() {
        set({ sessions: [], currentSessionId: '' })
      },
    }),
    {
      name: 'chat',
      version: 3.1,
    }
  )
)
