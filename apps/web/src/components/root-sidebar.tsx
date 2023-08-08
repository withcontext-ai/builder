import { getWorkspace } from '@/db/workspace/actions'

import AuthButton from './auth-button'
import WorkspaceSidebar from './workspace-sidebar'

export default async function RootSidebar() {
  const appList = await getWorkspace()

  return (
    <div className="h-full overflow-hidden lg:border-r lg:border-slate-200">
      <WorkspaceSidebar appList={appList} />
      <div className="fixed bottom-2 left-[72px]">
        <AuthButton />
      </div>
    </div>
  )
}
