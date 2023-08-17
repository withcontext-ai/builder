import { Message } from 'ai'
import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  messages: Message[]
  lastUpdate: number
}

function createEmptySession(): ChatSession {
  return {
    id: nanoid(),
    messages: [],
    lastUpdate: Date.now(),
  }
}

interface ChatStore {
  sessions: ChatSession[]
  currentSessionIndex: number
  clearSessions: () => void
  selectSession: (index: number) => void
  newSession: () => void
  currentSession: () => ChatSession
  onNewMessage: (message: Message) => void
  updateCurrentSession: (updater: (session: ChatSession) => void) => void
  clearAllData: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [createEmptySession()],
      currentSessionIndex: 0,

      clearSessions() {
        set(() => ({}))
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        })
      },

      newSession() {},

      deleteSession(index: number) {},

      currentSession() {
        let index = get().currentSessionIndex
        const sessions = get().sessions

        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index))
          set(() => ({ currentSessionIndex: index }))
        }

        const session = sessions[index]

        return session
      },

      onNewMessage(message) {
        get().updateCurrentSession((session) => {
          session.messages = session.messages.concat()
          session.lastUpdate = Date.now()
        })
      },
      updateMessage(
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: Message) => void
      ) {},

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = []
        })
      },

      updateCurrentSession(updater) {
        const sessions = get().sessions
        const index = get().currentSessionIndex
        updater(sessions[index])
        set(() => ({ sessions }))
      },

      clearAllData() {
        localStorage.clear()
        location.reload()
      },
    }),
    {
      name: 'chat',
      version: 3.1,
    }
  )
)
