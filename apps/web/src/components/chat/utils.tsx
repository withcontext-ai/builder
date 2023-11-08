import { type Message as RawMessage } from 'ai'

import { App } from '@/db/apps/schema'
import { Message as MessageSchema } from '@/db/messages/schema'
import { WorkflowItem } from '@/app/(app)/app/[app_id]/(manage)/settings/workflow/type'

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
      result.push({ ...m, role: 'user', content: m.query })
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
  if (m.role) return `${m.id}-${m.role}`
  return `${m.id}`
}

const getFormValueStr = (data: WorkflowItem) => {
  return JSON.parse(data?.formValueStr || '')
}

const getChainTypes = (data: any[]) => {
  return data.map((item: WorkflowItem) => {
    const formStr = getFormValueStr(item)
    return {
      type: item?.subType,
      video: formStr?.video?.enable_video_interaction,
    }
  }) as {
    type: string
    video: boolean
  }[]
}

export const validateOpenModal = (app: App) => {
  const published_workflow_data_str = JSON.parse(
    app?.published_workflow_data_str || ''
  )
  // check chains
  const openVideo = published_workflow_data_str?.some((item: WorkflowItem) => {
    const formStr = getFormValueStr(item)
    return formStr?.video?.enable_video_interaction === true
  })

  if (!openVideo) {
    return false
  }

  const chainTypes = getChainTypes(published_workflow_data_str) as {
    type: string
    video: boolean
  }[]
  const isConversation = chainTypes?.every(
    (item: any) => item?.type === 'conversation_chain'
  )
  if (isConversation) {
    return chainTypes?.slice(-1)[0]?.video
  }
  const findGlobal = chainTypes?.filter(
    (item: any) => item?.type === 'self_checking_chain'
  )
  return findGlobal?.some((item) => item?.video)
}
