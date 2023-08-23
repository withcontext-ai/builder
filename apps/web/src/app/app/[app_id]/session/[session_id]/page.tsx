import { nanoid } from 'nanoid'

import { safeParse } from '@/lib/utils'
import { getSession } from '@/db/sessions/actions'
import Chat from '@/components/chat/page'
import { ChatMessage } from '@/components/chat/types'

import AddAppToWorkspace from './add-app-to-workspace'
import AppNotFound from './app-not-found'

export const runtime = 'edge'

interface IProps {
  params: { app_id: string; session_id: string }
}

export default async function SessionPage({ params }: IProps) {
  const { app_id, session_id } = params
  const { session, app } = await getSession(session_id, app_id)
  let initialMessages: ChatMessage[] = safeParse(session.messages_str, [])
  if (app?.opening_remarks && !initialMessages?.length) {
    initialMessages = [
      {
        role: 'assistant',
        id: nanoid(),
        createdAt: app?.created_at,
        content: app?.opening_remarks,
        type: 'chat',
      },
    ]
  }

  return (
    <>
      <div className="h-full w-full overflow-hidden">
        <Chat
          mode="live"
          app={app}
          session={session}
          initialMessages={initialMessages}
          initialEvents={safeParse(session.events_str, [])}
        />
      </div>
      <AppNotFound archived={app?.archived || false} />
      <AddAppToWorkspace appId={app_id} />
    </>
  )
}
