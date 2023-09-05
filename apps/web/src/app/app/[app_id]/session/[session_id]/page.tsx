import { safeParse } from '@/lib/utils'
import { App } from '@/db/apps/schema'
import { getMessages } from '@/db/messages/actions'
import { Message } from '@/db/messages/schema'
import { getSession } from '@/db/sessions/actions'
import Chat from '@/components/chat/page'
import { ChatMessage, EventMessage, ProcessTask } from '@/components/chat/types'
import { TreeItem } from '@/components/dnd/types'

import { WorkflowItem } from '../../(manage)/settings/workflow/type'
import AddAppToWorkspace from './add-app-to-workspace'
import AppNotFound from './app-not-found'

export const runtime = 'edge'

function formatChatMessages(messages: Message[]) {
  return messages
    .filter((m) => m.type === 'chat')
    .map((m) => ({
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
    })) as ChatMessage[]
}

function formatEventMessages(messages: Message[]) {
  return messages
    .filter((m) => m.type === 'event')
    .map((m) => ({
      id: m.short_id,
      createdAt: m.created_at,
      role: m.role,
      content: m.content,
      type: 'event',
      eventType: m.event_type,
    })) as EventMessage[]
}

function getWorkflow(app: App) {
  const tree = safeParse(app.published_workflow_tree_str, []) as TreeItem[]
  const data = safeParse(app.published_workflow_data_str, []) as WorkflowItem[]

  const result = []

  for (const t of tree) {
    const d = data.find((d) => d.id === t.id)
    if (d)
      result.push({
        key: `${d.type}-${d.key}`,
        type: d.subType,
        status: 'none',
      } as ProcessTask)
  }

  return result
}

interface IProps {
  params: { app_id: string; session_id: string }
}

export default async function SessionPage({ params }: IProps) {
  const { app_id, session_id } = params
  const { session, app, user } = await getSession(session_id, app_id)

  const allMessages = await getMessages(session_id)
  const chatMessages = formatChatMessages(allMessages)
  const eventMessages = formatEventMessages(allMessages)

  const workflow = app ? getWorkflow(app) : []

  return (
    <>
      <div className="h-full w-full overflow-hidden">
        <Chat
          mode="live"
          app={app}
          session={session}
          user={user}
          initialMessages={chatMessages}
          initialEvents={eventMessages}
          workflow={workflow}
        />
      </div>
      <AppNotFound archived={app?.archived || false} />
      <AddAppToWorkspace appId={app_id} />
    </>
  )
}
