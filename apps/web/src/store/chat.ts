import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  date?: string
  streaming?: boolean
  content?: string
  globalId?: string
  role?: 'user' | 'ai'
  isError?: boolean
  name?: string
}
export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    globalId: `${Date.now()}`,
    date: new Date().toLocaleString(),
    role: 'user',
    name: '',
    content: '',
    ...override,
  }
}
export interface ChatStore {
  enabledAuth?: boolean
  convocationId: string
  globalId?: number
  sessions?: ChatSession[]
  currentSessionIndex: number
  messages?: ChatMessage[]
  clearSessions?: () => void
  updateMessage: (msg: ChatMessage[]) => void
  updateCurrentSession: (updater: (session: ChatSession) => void) => void
  sendMessage: (msg: string) => void
  onNewMessage: (message: ChatMessage) => void
  // onUserInput: (msg: string) => void
  getMessageWithMessage: (id: string) => ChatMessage[]
}

export interface ChatSession {
  id: number
  topic?: string
  memoryPrompt: string
  messages: ChatMessage[]
  stat: ChatStat
  lastUpdate: number
  lastSummarizeIndex: number
  clearContextIndex?: number
  // mask: Mask;
}

export interface ChatStat {
  tokenCount: number
  wordCount: number
  charCount: number
}

function createEmptySession(): ChatSession {
  return {
    id: Date.now() + Math.random(),
    // topic: DEFAULT_TOPIC, 暂时不开启不主题切换
    memoryPrompt: '',
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
  }
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentSessionIndex: 0,
      convocationId: '1',
      enabledAuth: false,
      globalId: 0,
      messages: [],
      sessions: [],
      sendMessage(content: string) {
        const userMessage: ChatMessage = createMessage({
          role: 'user',
          content,
        })

        const botMessage: ChatMessage = createMessage({
          role: 'ai',
          globalId: userMessage.globalId! + 1,
          streaming: true,
        })

        const current = get().messages
        const newMsg = current?.concat([userMessage, botMessage])
        set({ messages: newMsg })
        console.log(get().messages?.length, '--------message')
        // make request

        setTimeout(() => {
          botMessage.content = 'this is mock response'
          botMessage.streaming = false
          newMsg?.splice(newMsg?.length - 1, 0, botMessage)
          set({ messages: newMsg })
        }, 500)
      },
      getMessageWithMessage(id: string) {
        console.log(id, '---id')
        return []
      },
      updateMessage(newMsg: ChatMessage[]) {
        set({ messages: newMsg })
      },
      clearSessions() {
        set(() => ({
          sessions: [createEmptySession()],
          currentSessionIndex: 0,
        }))
      },
      onNewMessage(message) {
        get().updateCurrentSession((session) => {
          session.lastUpdate = Date.now()
        })
        // get().updateStat(message)
        // get().summarizeSession()
      },
      updateCurrentSession(updater) {
        const sessions = get().sessions
        const index = get().currentSessionIndex
        sessions?.length && updater(sessions[index])
        set(() => ({ sessions }))
      },
    }),
    {
      name: 'chat',
      version: 2,
      migrate(persistedState, version) {
        const state = persistedState as any
        const newState = JSON.parse(JSON.stringify(state)) as ChatStore

        if (version < 2) {
          newState.globalId = 0
          newState.sessions = []

          const oldSessions = state.sessions
          for (const oldSession of oldSessions) {
            const newSession = createEmptySession()
            newSession.topic = oldSession.topic
            newSession.messages = [...oldSession.messages]
            newState.sessions.push(newSession)
          }
        }
        return newState
      },
    }
  )
)
