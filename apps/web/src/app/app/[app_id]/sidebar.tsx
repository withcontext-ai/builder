import { getSessions } from '@/db/actions/sessions'

import AuthButton from '@/components/auth-button'
import SessionList from '@/components/session-list'

interface IProps {
  appId: string
}

export default async function AppSidebar({ appId }: IProps) {
  const sessionList = await getSessions(appId)

  return (
    <>
      <h1 className="p-4 text-2xl font-semibold">App: {appId}</h1>
      <div className="m-full h-px bg-slate-100" />
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <SessionList value={sessionList} appId={appId} />
      </div>
      <AuthButton />
    </>
  )
}
