import { PropsWithChildren } from 'react'

import WorkspaceSidebar from '@/components/workspace-sidebar'

const AppLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex h-full">
      <div className="hidden h-full lg:block">
        <WorkspaceSidebar />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default AppLayout
