import { getWorkspace } from '@/db/workspace/actions'

import NavSidebar from './nav-sidebar'
import WorkspaceSidebar from './workspace-sidebar'

export default async function RootSidebar() {
  const appList = await getWorkspace()

  return <WorkspaceSidebar appList={appList} />
}
