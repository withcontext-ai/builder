import { getApp } from '@/db/apps/actions'
import { getSessions } from '@/db/sessions/actions'
import AuthButton from '@/components/auth-button'
import SessionList from '@/components/session-list'

import Header from './sidebar-header'

interface IProps {
  appId: string
}

export default async function AppSidebar({ appId }: IProps) {
  const appDetail = await getApp(appId)
  const sessionList = await getSessions(appId)

  return (
    <>
      <Header
        appId={appId}
        name={appDetail.name}
        desc={appDetail.description}
        icon={appDetail.icon}
      />
      <div className="m-full h-px bg-slate-100" />
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <SessionList value={sessionList} appId={appId} />
      </div>
      <AuthButton />
    </>
  )
}
