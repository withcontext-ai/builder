import { Message } from 'ai'
import { MessagesSquare } from 'lucide-react'
import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ChatMessage, EventMessage } from '@/components/chat/types'

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
  eventMessages: EventMessage[]
  lastUpdate: number
}

function createEmptySession(
  id: string,
  messages?: ChatMessage[],
  events?: EventMessage[]
): ChatSession {
  return {
    id,
    messages: messages || [],
    eventMessages: events || [],
    lastUpdate: Date.now(),
  }
}

interface ChatStore {
  sessions: ChatSession[]
  currentSessionId: string
  selectSession: (id: string) => void
  newSession: (
    id: string,
    message?: ChatMessage[],
    event?: EventMessage[]
  ) => void
  removeSession: (id: string) => void
  currentSession: () => ChatSession
  onNewMessage: (message: ChatMessage[]) => void
  onNewEventMessage: (event: EventMessage[]) => void
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

      newSession(
        id: string,
        messages?: ChatMessage[],
        events?: EventMessage[]
      ) {
        const session = createEmptySession(id, messages, events)
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

      onNewEventMessage(event) {
        get().updateCurrentSession((session) => {
          session.eventMessages = event
          session.lastUpdate = Date.now()
        })
      },

      updateCurrentSession(updater) {
        const sessions = get().sessions
        const id = get().currentSessionId
        const index = sessions?.findIndex((item) => item?.id === id)
        updater(sessions[index])
        set(() => ({ sessions }))
      },
    }),
    {
      name: 'chat',
      version: 3.1,
    }
  )
)
