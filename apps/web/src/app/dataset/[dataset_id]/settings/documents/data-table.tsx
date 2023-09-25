'use client'

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { debounce } from 'lodash'
import { Loader2Icon, Settings2, Trash } from 'lucide-react'
import useSWR from 'swr'

import { cn, fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/ui/table/data-table'
import { DataTablePagination } from '@/components/ui/table/pagination'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { DataProps } from '@/app/dataset/type'

import DeleteData from './delete-data'
import FileIcon from './file-icon'
import { formateDate, formateNumber, formateStatus } from './utils'

interface IProps {
  preload?: DataProps[]
}

const TooltipButton = ({
  children,
  text,
}: {
  children: ReactNode
  text: string
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  )
}

const NodeDataChildren = () => (
  <div className="py-[74px] text-base">
    <div>There is no data yet.</div>You can upload data from different channels,
    such as PDF files, Notion documents, and so on.
  </div>
)

const DatasetTable = ({ preload = [] }: IProps) => {
  const [isPending, startTransition] = useTransition()
  const [noteDataNode, setNoDataNode] = useState<ReactNode | null>(
    NodeDataChildren
  )
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
    }).toString()

    return fetcher(`/api/datasets/${dataset_id}?${search}`, { method: 'GET' })
  }

  const { toast } = useToast()

  const editData = useCallback(
    async (uid: string) => {
      startTransition(() => {
        router.push(`/dataset/${dataset_id}/document/${uid}`)
      })
    },
    [dataset_id, router]
  )

  const { data, isValidating, isLoading } = useSWR<any>(
    [{ search: value }, pagination, deleted, dataset_id],
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
          <div className="flex w-[85px] items-center text-right">
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
            <div className="invisible z-10 flex gap-2 group-hover/cell:visible">
              {status === 0 && (
                <TooltipButton text="Edit">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={(e) => {
                      currentUid.current.uid = uid
                      e.stopPropagation()
                      editData(uid)
                    }}
                  >
                    {isPending && currentUid?.current?.uid === uid ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <Settings2 size={18} />
                    )}
                  </Button>
                </TooltipButton>
              )}
              <TooltipButton text="Delete">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen(true)
                    currentUid.current.uid = uid
                  }}
                >
                  <Trash size={18} />
                </Button>
              </TooltipButton>
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
        const params = encodeURIComponent(`name=${row?.name}&type=${row?.type}`)
        router.push(
          `/dataset/${dataset_id}/settings/documents/${row?.uid}/segments?${params}`
        )
        return
      }
    },
    [dataset_id, router, toast]
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
