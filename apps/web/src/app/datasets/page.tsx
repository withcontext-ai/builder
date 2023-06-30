import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import CategoriesSidebar from '@/components/sidebar-categories'
import SidebarLayout from '@/components/sidebar-layout'

const DatasetsPage = () => {
  return (
    <SidebarLayout
      sidebar={<CategoriesSidebar />}
      mainClassName="overflow-hidden"
    >
      <div className="flex h-full w-full flex-col">
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
        <div className=" flex flex-1">
          <div className="xs:grid-cols-1 grid max-w-[960px] cursor-pointer gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            <Card className="h-[132px]">
              <CardHeader>
                <CardTitle className="line-clamp-3 text-lg font-semibold leading-7">
                  This is a Document with very very very very long long name.pdf
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}

export default DatasetsPage
