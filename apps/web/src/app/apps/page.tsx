import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import CreateAppDialog from '@/components/create-app-dialog'
import HomeSidebar from '@/components/home-sidebar'
import SidebarLayout from '@/components/sidebar-layout'

export default async function Page() {
  return (
    <SidebarLayout sidebar={<HomeSidebar />}>
      <div className="flex flex-col">
        <div className="flex h-12 items-center justify-between px-6">
          <h1 className="font-medium">My Apps</h1>
          <CreateAppDialog
            dialogTrigger={
              <Button size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create App
              </Button>
            }
          />
        </div>
        <div className="m-full h-px bg-slate-100" />
      </div>
    </SidebarLayout>
  )
}
