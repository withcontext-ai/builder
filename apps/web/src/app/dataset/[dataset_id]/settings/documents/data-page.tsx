'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import DatasetTable from './data-table'

interface IProps {
  dataset_id: string
  preload?: any
}

const DataPage = ({ dataset_id, preload }: IProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handelClick = () => {
    startTransition(() => {
      router.push(`/dataset/${dataset_id}/document/add`)
    })
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="mb-10 mt-18 w-full pl-16 pr-8">
        {/* Desktop version, can edit */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">Data</div>
          <Button onClick={handelClick} type="button" disabled={isPending}>
            {isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Add New Data
          </Button>
        </div>
        <DatasetTable preload={preload} />
      </div>
    </div>
  )
}
export default DataPage
