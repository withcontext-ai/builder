import { Suspense } from 'react'

import { getDataset } from '@/db/datasets/actions'
import { Skeleton } from '@/components/ui/skeleton'
import ManageLayout from '@/components/layouts/manage-layout'

import Sidebar from './sidebar'

export const runtime = 'edge'

interface IProps {
  children: React.ReactNode
  params: { dataset_id: string }
}

const Loading = (
  <div>
    <div className="flex items-center space-x-2 px-4 py-3">
      <Skeleton className="h-8 w-1/2" />
    </div>
    <div className="mt-4 space-y-2 p-2">
      <div className="px-2">
        <Skeleton className="h-5 w-1/2" />
      </div>
      <Skeleton className="h-[84px] w-full" />
      <Skeleton className="h-[84px] w-full" />
      <div className="mb-2 shrink-0 px-3">
        <div className="h-px bg-slate-200" />
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  </div>
)

export default async function SettingsLayout({ children, params }: IProps) {
  const { dataset_id } = params
  const datasetDetail = await getDataset(dataset_id)
  return (
    <ManageLayout
      sidebar={
        <Suspense fallback={Loading}>
          <Sidebar datasetId={dataset_id} name={datasetDetail?.name} />
        </Suspense>
      }
    >
      {children}
    </ManageLayout>
  )
}
