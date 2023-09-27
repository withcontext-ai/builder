'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { debounce } from 'lodash'
import useSWR from 'swr'

import { fetcher } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { LoaderTypeProps, SegmentProps } from '@/app/dataset/type'

import AddOrEdit from './add-edit-segment'
import DeleteSegment from './delete-segment'
import SegmentHeader from './header'
import { DataTablePagination } from './pagination'
import SegmentList from './segment-list'

interface IProps {
  document_id: string
  dataset_id: string
}

const SegmentPage = ({ dataset_id, document_id }: IProps) => {
  const urlSearchParams = new URLSearchParams(
    decodeURIComponent(window.location.search)
  )
  const params = Object.fromEntries(urlSearchParams.entries())
  const { name } = params
  const type = params?.type as LoaderTypeProps
  const [open, setOpen] = useState(false)
  const [showDeleteAlter, setShowDeleteAlter] = useState(false)
  const [value, setValue] = useState('')
  const [fresh, setFresh] = useState(0)

  const [pagination, setPagination] = useState({
    pageSize: 100,
    pageIndex: 0,
  })
  const current = useRef<SegmentProps>({ content: '', segment_id: '' })

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
  const { data, isValidating } = useSWR<any>(
    [queries, pagination, fresh],
    getDatasetDocument,
    {
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
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value !== e?.target?.value) {
        setValue(e?.target?.value)
      }
    },
    [value]
  )

  const throttledOnChange = useMemo(() => debounce(onChange, 500), [onChange])
  return (
    <div className="h-full w-full overflow-auto py-[68px]">
      <SegmentHeader
        name={name}
        uid={document_id}
        type={type}
        addNew={() => {
          setOpen(true)
          current.current = { content: '', segment_id: '' }
        }}
      />
      <div className="pl-14 pr-8">
        <div className="mb-8 mt-6 flex">
          <Input
            className="w-[240px]"
            placeholder="Search"
            onChange={throttledOnChange}
          />
        </div>
        <div className="flex-1 flex-col">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ">
            {isValidating ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[182px] rounded-lg border border-transparent"
                />
              ))
            ) : (
              <SegmentList
                segments={data?.segments}
                setOpen={setOpen}
                current={current}
                setShowDeleteAlter={setShowDeleteAlter}
              />
            )}
          </div>
        </div>

        <div className="mt-8">
          <DataTablePagination table={table} />
        </div>
      </div>
      <DeleteSegment
        dataset_id={dataset_id}
        uid={document_id}
        segment_id={current?.current?.segment_id || ''}
        showDeleteAlter={showDeleteAlter}
        setShowDeleteAlter={setShowDeleteAlter}
        handelConfirm={() => setFresh((v) => v + 1)}
      />
      <AddOrEdit
        content={current?.current?.content || ''}
        open={open}
        segment_id={current?.current?.segment_id || ''}
        dataset_id={dataset_id}
        document_id={document_id}
        setOpen={setOpen}
        handelConfirm={() => setFresh((v) => v + 1)}
      />
    </div>
  )
}

export default SegmentPage
