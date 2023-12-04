import { type Message as RawMessage } from 'ai'

import { nanoid, safeParse } from '@/lib/utils'
import { App } from '@/db/apps/schema'
import { Message as MessageSchema } from '@/db/messages/schema'
import { WorkflowItem } from '@/app/(manage)/app/[app_id]/settings/workflow/type'

import { ChatMessage, EventMessage } from './types'

interface Message extends MessageSchema {
  role: RawMessage['role']
}

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
    annotation: m.annotation,
  }) as ChatMessage

export const eventMessagesFormatter = (m: Message) =>
  ({
    id: m.short_id,
    createdAt: m.created_at,
    role: m.role,
    content: m.content,
    type: 'event',
    eventType: m.event_type,
    call_duration: m.call_duration,
  }) as EventMessage

export const messageFormatter = (m: Message) => {
  if (m.type === 'chat') return chatMessagesFormatter(m)
  if (m.type === 'event') return eventMessagesFormatter(m)
  return null
}

export const messagesBuilder = (messages: Partial<MessageSchema>[]) => {
  const result = []
  for (const m of messages) {
    if (m.type === 'chat') {
      if (m.query) {
        result.push({ ...m, role: 'user', content: m.query })
      }
      if (m.answer) {
        result.push({ ...m, role: 'assistant', content: m.answer })
      }
    } else {
      result.push(m)
    }
  }
  return result as Message[]
}

export const keyBuilder = (m: RawMessage) => {
  if (m.role && m.id) return `${m.id}-${m.role}`
  if (!m.id) return nanoid()
  return `${m.id}`
}

export const checkIfWorkflowHasEnabledVideoInteraction = (app: App) => {
  const published_workflow_data_str = safeParse(
    app?.published_workflow_data_str
  )
  // check chains
  const openVideo = published_workflow_data_str?.some((item: WorkflowItem) => {
    const formStr = safeParse(item?.formValueStr)
    return formStr?.enable_video_interaction === true
  })

  return openVideo
}
