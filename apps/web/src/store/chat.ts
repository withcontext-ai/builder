import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ChatMessage = {
  date: string
  streaming?: boolean
  isError?: boolean
  id?: number
  role?: 'user' | 'assistant' | 'system'
  content: string
}

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: Date.now(),
    date: new Date().toLocaleString(),
    role: 'user',
    content: '',
    ...override,
  }
}

export interface ChatStat {
  tokenCount: number
  wordCount: number
  charCount: number
}

export interface ChatSession {
  id: number
  memoryPrompt: string
  messages: ChatMessage[]
  stat: ChatStat
  lastUpdate: number
  lastSummarizeIndex: number
  clearContextIndex?: number
  mask?: { topic?: string; name?: string }
}

export const BOT_HELLO: ChatMessage = createMessage({
  role: 'assistant',
  content: 'hello I am the assistant . what can i do for you?',
})

function createEmptySession(): ChatSession {
  return {
    id: Date.now() + Math.random(),
    memoryPrompt: '',
    messages: [BOT_HELLO],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
  }
}

interface ChatStore {
  sessions: ChatSession[]
  currentSessionIndex: number
  globalId: number
  clearSessions: () => void
  selectSession: (index: number) => void
  newSession: (mask?: any) => void
  deleteSession: (index: number) => void
  currentSession: () => ChatSession
  onNewMessage: (message: ChatMessage) => void
  onUserInput: (content: string) => Promise<void>
  summarizeSession: () => void
  updateStat: (message: ChatMessage) => void
  updateCurrentSession: (updater: (session: ChatSession) => void) => void
  updateMessage: (
    sessionIndex: number,
    messageIndex: number,
    updater: (message?: ChatMessage) => void
  ) => void
  resetSession: () => void
  getMessagesWithMemory: () => ChatMessage[]
  getMemoryPrompt: () => ChatMessage
  clearAllData: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [createEmptySession()],
      currentSessionIndex: 0,
      globalId: 0,

      clearSessions() {
        set(() => ({
          sessions: [createEmptySession()],
          currentSessionIndex: 0,
        }))
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        })
      },

      deleteSession(index) {
        const deletingLastSession = get().sessions.length === 1
        const deletedSession = get().sessions.at(index)

        if (!deletedSession) return

        const sessions = get().sessions.slice()
        sessions.splice(index, 1)

        const currentIndex = get().currentSessionIndex
        let nextIndex = Math.min(
          currentIndex - Number(index < currentIndex),
          sessions.length - 1
        )

        if (deletingLastSession) {
          nextIndex = 0
          sessions.push(createEmptySession())
        }

        // for undo delete action
        const restoreState = {
          currentSessionIndex: get().currentSessionIndex,
          sessions: get().sessions.slice(),
        }

        set(() => ({
          currentSessionIndex: nextIndex,
          sessions,
        }))
      },

      currentSession() {
        let index = get().currentSessionIndex
        const sessions = get().sessions
        console.log(index, sessions, '----current')
        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index))
          set(() => ({ currentSessionIndex: index }))
        }

        const session = sessions[index]

        return session
      },

      onNewMessage(message) {
        get().updateCurrentSession((session) => {
          session.lastUpdate = Date.now()
        })
        get().updateStat(message)
        get().summarizeSession()
      },

      async onUserInput(content) {
        const session = get().currentSession()
        // const modelConfig = session.mask.modelConfig;

        const userMessage: ChatMessage = createMessage({
          role: 'user',
          content,
        })

        const botMessage: ChatMessage = createMessage({
          role: 'assistant',
          streaming: true,
          id: userMessage.id! + 1,
          // model: modelConfig.model,
        })

        const systemInfo = createMessage({
          role: 'system',
          content: `IMPORTANT: You are a virtual assistant powered by the model, now time is ${new Date().toLocaleString()}}`,
          id: botMessage.id! + 1,
        })

        // get recent messages

        const recentMessages = get().getMessagesWithMemory()
        const sendMessages = recentMessages.concat(userMessage)

        const sessionIndex = get().currentSessionIndex
        const messageIndex = get().currentSession().messages.length + 1

        // save user's and bot's message
        get().updateCurrentSession((session) => {
          session.messages.push(userMessage)
          session.messages.push(botMessage)
        })

        // make request
        console.log('[User Input] ', sendMessages)
        setTimeout(() => {
          botMessage.streaming = false
          botMessage.content = 'this is mock response.please wait a minute'
          get().onNewMessage(botMessage)
        }, 500)
        // api.llm.chat({
        //   messages: sendMessages,
        //   config: { ...modelConfig, stream: true },
        //   onUpdate(message) {
        //     botMessage.streaming = true;
        //     if (message) {
        //       botMessage.content = message;
        //     }
        //     set(() => ({}));
        //   },
        //   onFinish(message) {
        //     botMessage.streaming = false;
        //     if (message) {
        //       botMessage.content = message;
        //       get().onNewMessage(botMessage);
        //     }
        //     ChatControllerPool.remove(
        //       sessionIndex,
        //       botMessage.id ?? messageIndex,
        //     );
        //     set(() => ({}));
        //   },
        //   onError(error) {
        //     const isAborted = error.message.includes("aborted");
        //     botMessage.content =
        //       "\n\n" +
        //       prettyObject({
        //         error: true,
        //         message: error.message,
        //       });
        //     botMessage.streaming = false;
        //     userMessage.isError = !isAborted;
        //     botMessage.isError = !isAborted;

        //     set(() => ({}));
        //     ChatControllerPool.remove(
        //       sessionIndex,
        //       botMessage.id ?? messageIndex,
        //     );

        //     console.error("[Chat] failed ", error);
        //   },
        //   onController(controller) {
        //     // collect controller for stop/retry
        //     ChatControllerPool.addController(
        //       sessionIndex,
        //       botMessage.id ?? messageIndex,
        //       controller,
        //     );
        //   },
        // });
      },

      getMemoryPrompt() {
        const session = get().currentSession()

        return {
          role: 'system',
          content: 'this is system ',
          date: '',
        } as ChatMessage
      },
      newSession(mask) {
        const session = createEmptySession()

        set(() => ({ globalId: get().globalId + 1 }))
        session.id = get().globalId

        // if (mask) {
        //   session.mask = { ...mask };
        //   session.topic = mask.name;
        // }

        set((state) => ({
          currentSessionIndex: 0,
          sessions: [session].concat(state.sessions),
        }))
      },
      getMessagesWithMemory() {
        const session = get().currentSession()

        // wont send cleared context messages
        const clearedContextMessages = session.messages.slice(
          session.clearContextIndex ?? 0
        )
        const messages = clearedContextMessages.filter((msg) => !msg.isError)
        const n = messages.length

        // get recent messages as many as possible

        // concat
        console.log(messages, '0000message')
        return messages
      },

      updateMessage(
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: ChatMessage) => void
      ) {
        const sessions = get().sessions
        const session = sessions.at(sessionIndex)
        const messages = session?.messages
        updater(messages?.at(messageIndex))
        set(() => ({ sessions }))
      },

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = []
          session.memoryPrompt = ''
        })
      },

      summarizeSession() {},

      updateStat(message) {
        get().updateCurrentSession((session) => {
          session.stat.charCount += message.content.length
          // TODO: should update chat count and word count
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
      name: 'chat-next-web-store',
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
            newSession.messages = [...oldSession.messages]
            newState.sessions.push(newSession)
          }
        }
        return newState
      },
    }
  )
)

export function estimateTokenLength(input: string): number {
  let tokenLength = 0

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i)

    if (charCode < 128) {
      // ASCII character
      if (charCode <= 122 && charCode >= 65) {
        // a-Z
        tokenLength += 0.25
      } else {
        tokenLength += 0.5
      }
    } else {
      // Unicode character
      tokenLength += 1.5
    }
  }

  return tokenLength
}
