'use client'

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { debounce } from 'lodash'
import { Loader2Icon } from 'lucide-react'
import useSWR from 'swr'

import { cn, fetcher } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/table/data-table'
import { DataTablePagination } from '@/components/ui/table/pagination'
import { useToast } from '@/components/ui/use-toast'
import { DataProps } from '@/app/dataset/type'

import { formateDate, formateNumber, formateStatus } from '../../../utils'
import DeleteData from './delete-data'
import FileIcon from './file-icon'
import TableAction from './table-action'

interface IProps {
  preload?: DataProps[]
  datasetId: string
}

const NodeDataChildren = () => (
  <div className="py-[74px] text-base">
    <div>There is no data yet.</div>You can upload data from different channels,
    such as PDF files, Notion documents, and so on.
  </div>
)

const DatasetTable = ({ preload = [], datasetId }: IProps) => {
  const [noteDataNode, setNoDataNode] = useState<ReactNode | null>(
    NodeDataChildren
  )

  const [open, setOpen] = useState(false)
  const currentUid = useRef({ uid: '' })
  const router = useRouter()

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
    }).toString()

    return fetcher(`/api/datasets/${datasetId}?${search}`, { method: 'GET' })
  }

  const { toast } = useToast()

  const { data, isValidating, isLoading } = useSWR<any>(
    [{ search: value }, pagination, datasetId],
    getDatasetDocument,
    {
      fallbackData: preload,
      keepPreviousData: true,
      refreshInterval: 1000,
    }
  )
  const columns: ColumnDef<DataProps>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Data Name',
        cell: ({ row }) => {
          return (
            <div className="max-w-lg">
              <FileIcon data={row.original} />
            </div>
          )
        },
      },
      {
        accessorKey: 'Characters',
        header: 'Characters',
        cell: ({ row }) => (
          <div className="flex w-[70px] items-center justify-end">
            {formateNumber(row.original?.characters || 0)}
            {isValidating && row.original?.status === 1 && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-black" />
            )}
          </div>
        ),
      },
      {
        accessorKey: 'updated_at',
        header: 'Update Time',
        cell: ({ row }) => (
          <div className="w-[146px]">
            {formateDate(row?.original?.updated_at || new Date())}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const { status } = row.original
          const { text, color } = formateStatus(status || 0)
          return (
            <div
              className={cn(
                'flex w-[100px] items-center gap-1 text-left',
                color
              )}
            >
              {text}
              {isValidating && status === 1 && (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-black" />
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'uid',
        header: '',
        cell: ({ row }) => {
          const { status, type, uid } = row.original
          return (
            <TableAction
              setOpen={setOpen}
              status={status}
              type={type}
              uid={uid}
              datasetId={datasetId}
              currentUid={currentUid}
            />
          )
        },
      },
    ],
    [datasetId, isValidating]
  )

  const handleRowClick = useCallback(
    (row: any) => () => {
      if (row?.status === 1) {
        toast({
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
        const nextUrl = '/datasets'

        const params = encodeURIComponent(
          `name=${row?.name}&type=${row?.type}&nextUrl=${nextUrl}`
        )
        router.push(
          `/dataset/${datasetId}/settings/documents/${row?.uid}/segments?${params}`
        )
        return
      }
    },
    [datasetId, router, toast]
  )

  useEffect(() => {
    if (value && data?.data?.length === 0) {
      setNoDataNode(null)
    }
  }, [value, data?.data])

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil(data?.count || 0),
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
        isLoading={isLoading}
        colSpan={5}
        noDataChildren={noteDataNode}
        onRowClick={handleRowClick}
      />
      <DataTablePagination table={table} />
      <DeleteData
        datasetId={datasetId}
        uid={currentUid?.current?.uid}
        open={open}
        setOpen={setOpen}
      />
    </div>
  )
}

export default DatasetTable
