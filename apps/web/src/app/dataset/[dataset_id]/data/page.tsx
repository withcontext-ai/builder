'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon, Plus } from 'lucide-react'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import DatasetTable from './data-table'

interface IProps {
  params: { dataset_id: string }
}

function getDocuments(url: string) {
  return fetcher(url, {
    method: 'GET',
  })
}

const DataPage = ({ params }: IProps) => {
  const router = useRouter()
  const [preloaded, setPreloaded] = useState()
  const { dataset_id } = params
  const [isPending, startTransition] = useTransition()
  const { trigger } = useSWRMutation(
    `/api/datasets/${dataset_id}`,
    getDocuments
  )

  const handelClick = () => {
    startTransition(() => {
      router.push(`/dataset/${dataset_id}/add`)
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
        <DatasetTable />
      </div>
    </div>
  )
}
export default DataPage
