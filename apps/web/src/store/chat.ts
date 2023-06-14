import { create } from 'zustand'

interface ChatStore {
  messages?: Record<string, any>
}

export const useChatStore = create(() => ({
  enabledAuth: false,
}))
