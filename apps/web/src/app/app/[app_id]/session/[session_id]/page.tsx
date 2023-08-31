import { safeParse } from '@/lib/utils'
import { App } from '@/db/apps/schema'
import { getSession } from '@/db/sessions/actions'
import Chat from '@/components/chat/page'

import AddAppToWorkspace from './add-app-to-workspace'
import AppNotFound from './app-not-found'

// export const runtime = 'edge'

function getWorkflow(app: App) {
  // const tree = safeParse(app.published_workflow_tree_str, [])
  const tree = safeParse(app.workflow_tree_str, [])
  // const data = safeParse(app.published_workflow_data_str, [])
  const data = safeParse(app.workflow_data_str, [])
  return tree.map((t: any) => {
    const d = data.find((d: any) => d.id === t.id)
    return {
      key: `${d.type}-${d.key}`,
      type: d.subType,
    }
  })
}

interface IProps {
  params: { app_id: string; session_id: string }
}

export default async function SessionPage({ params }: IProps) {
  const { app_id, session_id } = params
  const { session, app, user } = await getSession(session_id, app_id)

  const workflow = app ? getWorkflow(app) : []

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
          workflow={workflow}
        />
      </div>
      <AppNotFound archived={app?.archived || false} />
      <AddAppToWorkspace appId={app_id} />
    </>
  )
}
