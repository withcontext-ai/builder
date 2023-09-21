'use client'

import { useCallback, useMemo, useRef, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { debounce } from 'lodash'
import { FileType2, Loader2Icon, Trash } from 'lucide-react'
import useSWR from 'swr'

import { cn, fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/table/data-table'
import { DataTablePagination } from '@/components/ui/table/pagination'
import { useToast } from '@/components/ui/use-toast'
import { DataProps } from '@/app/dataset/type'

import DeleteData from './delete-data'
import FileIcon from './file-icon'
import { formateDate, formateNumber, formateStatus } from './utils'

interface IProps {
  preload?: DataProps[]
}

const DatasetTable = ({ preload = [] }: IProps) => {
  const [isPending, startTransition] = useTransition()
  // to refresh table when deleted data
  const [deleted, setDeleted] = useState(0)
  const [open, setOpen] = useState(false)
  const currentUid = useRef({ uid: '' })
  const router = useRouter()
  const { dataset_id } = useParams() as {
    dataset_id: string
  }
  const [value, setValue] = useState('')
  const [pagination, setPagination] = useState({
    pageSize: 10,
    pageIndex: 0,
  })

  async function getDatasetDocument(
    params: [queries: Record<string, any>, pagination: Record<string, any>]
  ) {
    const [queries, pagination] = params
    const search = new URLSearchParams({
      ...queries,
      ...pagination,
      dataset_id,
    }).toString()

    return fetcher(`/api/datasets/document/?${search}`, {
      method: 'GET',
    })
  }

  const { toast } = useToast()

  const editData = useCallback(
    async (document_id: string) => {
      startTransition(() => {
        router.push(`/dataset/${dataset_id}/document/${document_id}`)
      })
    },
    [dataset_id, router]
  )

  const { data = [], isValidating } = useSWR<any>(
    [{ search: value }, pagination, deleted, dataset_id],
    getDatasetDocument,
    {
      fallbackData: preload,
      keepPreviousData: true,
    }
  )

  const columns: ColumnDef<DataProps>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Data Name',
        cell: ({ row }) => {
          return <FileIcon data={row.original} />
        },
      },
      {
        accessorKey: 'Characters',
        header: 'characters',
        cell: ({ row }) => formateNumber(row.original?.characters || 0),
      },
      {
        accessorKey: 'updated_at',
        header: 'Update Time',
        cell: ({ row }) => formateDate(row?.original?.updated_at || new Date()),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const { status } = row.original
          const { text, color } = formateStatus(status || 0)
          return <div className={cn('text-left', color)}>{text}</div>
        },
      },
      {
        accessorKey: 'id',
        header: '',
        cell: ({ row }) => {
          const { status, type, uid, short_id = '' } = row.original
          return (
            <div className="invisible z-10 flex gap-2 group-hover/cell:visible">
              {status === 0 && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={(e) => {
                    currentUid.current.uid = uid
                    e.stopPropagation()
                    editData(short_id || '')
                  }}
                >
                  {isPending && currentUid?.current?.uid === uid ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileType2 size={18} />
                  )}
                </Button>
              )}
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(true)
                  currentUid.current.uid = short_id
                }}
              >
                <Trash size={18} />
              </Button>
            </div>
          )
        },
      },
    ],
    [editData, isPending]
  )

  const handleRowClick = useCallback(
    (row: any) => () => {
      if (row?.status === 1) {
        toast({
          variant: 'destructive',
          description: 'Indexing in progress, please wait..',
        })
        return
      }
      if (row?.status === 2) {
        toast({
          variant: 'destructive',
          description: 'Indexing failed, please re-upload.',
        })
        return
      } else {
        router.push(
          `/dataset/${dataset_id}/settings/documents/${row?.uid}/segments`
        )
        return
      }
    },
    [dataset_id, router, toast]
  )
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil((data?.length || 0) / pagination.pageSize),
  })
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e?.target?.value)
  }, [])
  const throttledOnChange = useMemo(() => debounce(onChange, 500), [onChange])
  return (
    <div className="space-y-8">
      <div className="mb-8 flex">
        <Input
          className="w-[240px]"
          placeholder="Search"
          onChange={throttledOnChange}
        />
      </div>
      <DataTable
        table={table}
        isLoading={isValidating}
        colSpan={5}
        noDataChildren={
          <div className="py-[74px] text-base">
            <div>There is no data yet.</div>You can upload data from different
            channels, such as PDF files, Notion documents, and so on.
          </div>
        }
        onRowClick={handleRowClick}
      />
      <DataTablePagination table={table} />
      <DeleteData
        datasetId={dataset_id}
        uid={currentUid?.current?.uid}
        open={open}
        setOpen={setOpen}
        confirmDelete={() => setDeleted((v) => v + 1)}
      />
    </div>
  )
}

export default DatasetTable
