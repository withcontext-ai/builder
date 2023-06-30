'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import CreateAppDialog from '@/components/create-app-dialog'
import CategoriesSidebar from '@/components/sidebar-categories'
import SidebarLayout from '@/components/sidebar-layout'

import AppLists from '../app/app-list'

const MyApps = () => {
  return (
    <SidebarLayout
      sidebar={<CategoriesSidebar />}
      mainClassName="overflow-hidden"
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-6 py-1 text-base font-medium leading-[48px]">
            My Apps
            <CreateAppDialog
              dialogTrigger={
                <Button className="gap-1">
                  <Plus size={16} />
                  Create App
                </Button>
              }
            />
          </div>
          <div className="h-[1px] w-full bg-slate-100 " />
        </div>
        <div className="flex flex-1 overflow-y-auto">
          <AppLists />
        </div>
      </div>
    </SidebarLayout>
  )
}

export default MyApps
