import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  date?: string
  loading?: boolean
  content?: string
  id?: string
  role?: 'user' | 'ai'
  isError?: boolean
  name?: string
}
export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: `${Date.now()}`,
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
  messages?: ChatMessage[]
  sendMessage: (msg: string) => void
  // onUserInput: (msg: string) => void
  getMessageWithMessage: (id: string) => ChatMessage[]
}

const mockMessage = [
  {
    role: 'ai',
    name: 'AI IInterview',
    date: '9:26AM',
    content: 'hello what can i do for you',
  },
  {
    role: 'user',
    name: 'ME',
    date: '9:50AM',
    content: 'could you please tell me how to prepare for an interview',
  },
  {
    role: 'ai',
    name: 'ME',
    date: '10:50AM',
    content:
      'The Context Company Employee Handbook outlines rules and regulations for employees, emphasizing the importance of integrating into the company and maintaining a positive attitude. The company values integrity, respect, and transparency, and provides a fair and equitable work environment. The recruitment process involves applying to HR, submitting documents, and undergoing training, with a six-month trial period and closely monitored attendance.',
  },
]

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      convocationId: '1',
      enabledAuth: false,
      messages: [],
      sendMessage(content: string) {
        const userMessage: ChatMessage = createMessage({
          role: 'user',
          content,
        })

        console.log(content, '---content')

        const botMessage: ChatMessage = createMessage({
          role: 'ai',
          id: userMessage.id! + 1,
          content: 'this is bot mock content',
        })

        const current = get().getMessageWithMessage('1')
        const newMsg = current?.concat([userMessage, botMessage])
        set({ messages: newMsg })
      },
      // @ts-ignore
      getMessageWithMessage(id: string) {
        console.log(id, '---id')
        return mockMessage
      },
    }),
    {
      name: 'chat',
      version: 2,
    }
  )
)
