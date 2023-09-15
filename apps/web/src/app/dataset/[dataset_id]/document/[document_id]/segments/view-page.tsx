'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { throttle } from 'lodash'
import { Loader2, Search, Trash } from 'lucide-react'
import useSWR from 'swr'

import { cn, fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTablePagination } from '@/components/ui/table/pagination'

import { LoadingCard, PreviewCard } from '../preview'
import AddOrEdit from './add-edit-segment'
import DeleteSegment from './delete-segment'

interface IProps {
  preload: any[]
  document_id?: string
  dataset_id?: string
}

const SegmentPage = ({ preload = [], dataset_id, document_id }: IProps) => {
  const [open, setOpen] = useState(false)
  const [showDeleteAlter, setShowDeleteAlter] = useState(false)
  const [value, setValue] = useState('')
  // const [data, setData] = useState(preload)
  const [pagination, setPagination] = useState({
    pageSize: 100,
    pageIndex: 0,
  })
  const current = useRef({ content: '', segment_id: '' })

  async function getDatasetDocument(
    params: [queries: Record<string, any>, pagination: Record<string, any>]
  ) {
    const [queries, pagination] = params
    const search = new URLSearchParams({
      ...queries,
      ...pagination,
    }).toString()

    return fetcher(`/api/datasets/segment?${search}`, { method: 'GET' })
  }
  const queries = { dataset_id, uid: document_id, search: value }
  const { data = [], isValidating } = useSWR<any>(
    [queries, pagination],
    getDatasetDocument,
    {
      fallbackData: preload,
      keepPreviousData: true,
    }
  )

  const table = useReactTable({
    data: data?.segments,
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil((data?.totalItems || 0) / pagination.pageSize),
  })

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e?.target?.value)
  }, [])
  const throttledOnChange = useMemo(() => throttle(onChange, 500), [onChange])

  return (
    <div>
      <div className="mb-8 flex">
        <Input
          className="w-[240px]"
          placeholder="Search"
          onChange={throttledOnChange}
        />
      </div>
      <div className="flex-1 flex-col">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ">
          {isValidating
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[182px] rounded-lg border border-transparent"
                />
              ))
            : data?.segments?.map((item: any, index: number) => {
                return (
                  <div
                    key={index}
                    className="group/card relative h-[182px] cursor-pointer"
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
        </div>
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
        {data?.length > 100 && (
          <DataTablePagination table={table} showPageSizes={false} />
        )}
      </div>
    </div>
  )
}

export default SegmentPage
