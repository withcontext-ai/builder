import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

import DatasetTable from './data-table'

const DataPage = () => {
  return (
    <div className="h-full w-full overflow-auto">
      <div className="mb-10 mt-18 w-full pl-16 pr-8">
        {/* Desktop version, can edit */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">Data</div>
          <Button>
            <Plus size={16} />
            Add New Data
          </Button>
        </div>
        <DatasetTable />

        {/* Mobile version, view only */}
        {/* <DatasetViewer
    name={datasetDetail?.name}
    config={datasetDetail?.config || {}}
  /> */}
      </div>
    </div>
  )
}
export default DataPage
