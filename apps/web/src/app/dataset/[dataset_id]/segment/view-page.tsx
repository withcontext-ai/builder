'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { throttle } from 'lodash'
import { Search, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '@/components/ui/table/pagination'

import { PreviewCard } from '../[document_id]/preview'
import AddOrEdit from './add-edit-segment'

interface IProps {
  preload: any
}

const SegmentPage = ({ preload }: IProps) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [data, setData] = useState(preload)
  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageIndex: 0,
  })
  const current = useRef({ text: '', characters: 0 })
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
                // @ts-ignore
                current.current = item
              }}
            >
              <PreviewCard
                characters={item?.characters}
                index={index}
                text={item?.text}
              />
              <Button
                type="button"
                className="invisible absolute bottom-4 right-4 flex h-8 w-8 gap-2 text-red-600 group-hover/card:visible"
                size="icon"
                variant="outline"
              >
                <Trash size={18} />
              </Button>
            </div>
          )
        })}
        <AddOrEdit
          text={current?.current?.text}
          characters={current?.current?.characters}
          open={open}
          setOpen={setOpen}
        />
      </div>
      <div>
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}

export default SegmentPage
