import { Message } from '@/db/messages/schema'

import { ChatMessage, EventMessage } from './types'

export const chatMessagesFilter = (m: Message) => m.type === 'chat'

export const eventMessagesFilter = (m: Message) => m.type === 'event'

export const chatMessagesFormatter = (m: Message) =>
  ({
    id: m.short_id,
    createdAt: m.created_at,
    role: m.role,
    content: m.content,
    type: 'chat',
    feedback: m.feedback,
    feedback_content: m.feedback_content,
    meta: {
      latency: m.latency,
      token: {
        total_tokens: m.total_tokens,
      },
      raw: m.raw,
    },
  }) as ChatMessage

export const eventMessagesFormatter = (m: Message) =>
  ({
    id: m.short_id,
    createdAt: m.created_at,
    role: m.role,
    content: m.content,
    type: 'event',
    eventType: m.event_type,
  }) as EventMessage

export const messageFormatter = (m: Message) => {
  if (m.type === 'chat') return chatMessagesFormatter(m)
  if (m.type === 'event') return eventMessagesFormatter(m)
  return null
}
