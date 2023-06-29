import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import CategoriesSidebar from '@/components/sidebar-categories'
import SidebarLayout from '@/components/sidebar-layout'

const DatasetsPage = () => {
  return (
    <SidebarLayout sidebar={<CategoriesSidebar />}>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-6 py-1 text-base font-medium leading-[48px]">
            Datasets
            <Button className="gap-1">
              <Plus size={16} />
              Add Datasets
            </Button>
          </div>
          <div className="h-[1px] w-full bg-slate-100 " />
        </div>
        datasets
      </div>
    </SidebarLayout>
  )
}

export default DatasetsPage
