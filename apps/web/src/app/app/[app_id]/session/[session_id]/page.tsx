import { getSession } from '@/db/sessions/actions'
import Chat from '@/components/chat/page'

import AddAppToWorkspace from './add-app-to-workspace'
import AppNotFound from './app-not-found'

interface IProps {
  params: { app_id: string; session_id: string }
}

export default async function SessionPage({ params }: IProps) {
  const { app_id, session_id } = params
  const { sessions, apps } = await getSession(session_id)

  return (
    <>
      <div className="h-full w-full overflow-hidden">
        <Chat
          apiSessionId={sessions.api_session_id!}
          sessionId={session_id}
          sessionName={sessions.name}
          appId={apps?.short_id || ''}
          appName={apps?.name || ''}
          appIcon={apps?.icon || ''}
        />
      </div>
      <AppNotFound archived={apps?.archived || false} />
      <AddAppToWorkspace appId={app_id} />
    </>
  )
}
