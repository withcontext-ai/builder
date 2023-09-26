'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataProps } from '@/app/dataset/type'

import DatasetTable from './data-table'

interface IProps {
  datasetId: string
  preload?: DataProps[]
}

const DataPage = ({ datasetId, preload }: IProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handelClick = () => {
    startTransition(() => {
      router.push(`/dataset/${datasetId}/document/add`)
    })
  }

  return (
    <div className="hidden h-full w-full overflow-auto lg:block">
      <div className="mb-10 mt-18 w-full pl-16 pr-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-2xl font-semibold">Data</div>
          <Button
            onClick={handelClick}
            type="button"
            disabled={isPending}
            className="flex gap-1"
          >
            {isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add New Data
          </Button>
        </div>
        <DatasetTable preload={preload} datasetId={datasetId} />
      </div>
    </div>
  )
}
export default DataPage
