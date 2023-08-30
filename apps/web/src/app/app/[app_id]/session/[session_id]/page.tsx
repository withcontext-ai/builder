import { safeParse } from '@/lib/utils'
import { App } from '@/db/apps/schema'
import { getSession } from '@/db/sessions/actions'
import Chat from '@/components/chat/page'

import AddAppToWorkspace from './add-app-to-workspace'
import AppNotFound from './app-not-found'

// export const runtime = 'edge'

function getTasks(app: App) {
  const tree = safeParse(app.published_workflow_tree_str, [])
  const data = safeParse(app.published_workflow_data_str, [])
  const tasks = tree.map((t: any) => {
    const d = data.find((d: any) => d.id === t.id)
    return {
      id: d.id,
      type: d.type,
      subType: d.subType,
      key: d.key,
    }
  })
  return tasks
}

interface IProps {
  params: { app_id: string; session_id: string }
}

export default async function SessionPage({ params }: IProps) {
  const { app_id, session_id } = params
  const { session, app, user } = await getSession(session_id, app_id)

  const tasks = app ? getTasks(app) : []
  console.log('tasks:', tasks)

  return (
    <>
      <div className="h-full w-full overflow-hidden">
        <Chat
          mode="live"
          app={app}
          session={session}
          user={user}
          initialMessages={safeParse(session.messages_str, [])}
          initialEvents={safeParse(session.events_str, [])}
        />
      </div>
      <AppNotFound archived={app?.archived || false} />
      <AddAppToWorkspace appId={app_id} />
    </>
  )
}
