'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { throttle } from 'lodash'
import { Search, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '@/components/ui/table/pagination'

import { PreviewCard } from '../preview'
import AddOrEdit from './add-edit-segment'
import DeleteSegment from './delete-segment'

interface IProps {
  preload: any
  document_id?: string
  dataset_id?: string
}

const SegmentPage = ({ preload, dataset_id, document_id }: IProps) => {
  const [open, setOpen] = useState(false)
  const [showDeleteAlter, setShowDeleteAlter] = useState(false)
  const [value, setValue] = useState('')
  const [data, setData] = useState(preload)
  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageIndex: 0,
  })
  const current = useRef({ content: '', segment_id: '' })
  const table = useReactTable({
    data,
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil((data?.length || 0) / pagination.pageSize),
  })
  return (
    <div>
      <div className="mb-8 flex">
        <Input
          className="w-[240px]"
          placeholder="Search"
          onChange={(e) => {
            throttle(() => {
              setValue(e?.target?.value)
            }, 500)
          }}
        />
      </div>
      <div className="mb-8 flex grid-cols-2 gap-4">
        {data?.map((item: any, index: number) => {
          return (
            <div
              key={index}
              className="group/card relative cursor-pointer"
              onClick={(e) => {
                setOpen(true)
                e.preventDefault()
                current.current = item
              }}
            >
              <PreviewCard index={index} content={item?.content} />
              <Button
                type="button"
                className="invisible absolute bottom-4 right-4 flex h-8 w-8 gap-2 text-red-600 group-hover/card:visible"
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteAlter(true)
                  current.current = item
                }}
              >
                <Trash size={18} />
              </Button>
            </div>
          )
        })}
        <AddOrEdit
          content={current?.current?.content}
          open={open}
          segment_id={current?.current?.segment_id}
          dataset_id={dataset_id}
          document_id={document_id}
          setOpen={setOpen}
        />
        <DeleteSegment
          dataset_id={dataset_id}
          uid={document_id}
          segment_id={current?.current?.segment_id}
          showDeleteAlter={showDeleteAlter}
          setShowDeleteAlter={setShowDeleteAlter}
        />
      </div>
      <div>
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}

export default SegmentPage
