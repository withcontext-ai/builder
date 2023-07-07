import Link from 'next/link'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import DatasetCard from '@/components/dataset-card'
import HomeSidebar from '@/components/home-sidebar'
import SidebarLayout from '@/components/sidebar-layout'

const LIST = [
  {
    id: 'd1',
    title:
      'Dataset 1, Dataset 1, Dataset 1, Dataset 1, Dataset 1, Dataset 1, Dataset 1, Dataset 1',
  },
  {
    id: 'd2',
    title: 'Dataset 2',
  },
  {
    id: 'd3',
    title: 'Dataset 3',
  },
  {
    id: 'd4',
    title: 'Dataset 4',
  },
  {
    id: 'd5',
    title: 'Dataset 5, Dataset 5, Dataset 5',
  },
  {
    id: 'd6',
    title: 'Dataset 6',
  },
]

export default async function Page() {
  return (
    <SidebarLayout sidebar={<HomeSidebar />}>
      <div className="flex flex-col">
        <div className="flex h-12 items-center justify-between px-6">
          <h1 className="font-medium">My Datasets</h1>
          <Link href="/dataset/new">
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Dataset
            </Button>
          </Link>
        </div>
        <div className="m-full h-px bg-slate-100" />
        <div className="p-6">
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LIST.map(({ id, title }) => (
              <DatasetCard key={id} id={id} title={title} />
            ))}
          </ul>
        </div>
      </div>
    </SidebarLayout>
  )
}
