'use client'

import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import DatasetTable from './data-table'

interface IProps {
  params: { dataset_id: string }
}

const DataPage = ({ params }: IProps) => {
  const router = useRouter()
  const { dataset_id } = params

  return (
    <div className="h-full w-full overflow-auto">
      <div className="mb-10 mt-18 w-full pl-16 pr-8">
        {/* Desktop version, can edit */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">Data</div>
          <Button
            onClick={() => router.push(`/dataset/${dataset_id}/add-edit-data`)}
          >
            <Plus size={16} />
            Add New Data
          </Button>
        </div>
        <DatasetTable />
      </div>
    </div>
  )
}
export default DataPage
