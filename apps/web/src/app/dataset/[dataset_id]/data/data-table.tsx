'use client'

import { useCallback, useMemo, useRef, useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { FileType2, Loader2Icon, RefreshCcw } from 'lucide-react'
import useSWR from 'swr'

import { cn, fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/table/data-table'
import { DataTablePagination } from '@/components/ui/table/pagination'
import { useToast } from '@/components/ui/use-toast'
import GenericFilter, { GenericFilterType } from '@/components/generic-filter'
import { PdfImage } from '@/components/upload/component'

import DeleteData from './delete-data'
import { DataProps } from './utils'

interface IProps {
  preload: any
}

const DatasetTable = ({ preload }: IProps) => {
  const [isPending, startTransition] = useTransition()
  const currentUid = useRef({ uid: '' })
  const router = useRouter()
  const { dataset_id } = useParams() as {
    dataset_id: string
  }
  const [queries, setQueries] = useState({
    search: '',
  })
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

  const handleFilterChange = useCallback(async (key: string, value: any) => {
    setQueries((prev) => ({ ...prev, [key]: value }))
  }, [])

  const { toast } = useToast()

  const editData = useCallback(
    async (uid: string) => {
      startTransition(() => {
        router.push(`/dataset/${dataset_id}/${uid}`)
      })
    },
    [dataset_id, router]
  )

  const filters: GenericFilterType[] = useMemo(
    () => [
      {
        type: 'text',
        key: 'search',
        placeholder: 'Search',
      },
    ],
    []
  )

  const { data = [], isValidating } = useSWR<any>(
    [queries, pagination],
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
          return (
            <div className="flex items-center gap-1">
              {row.original?.type == 'pdf' ? (
                <PdfImage className="h-4 w-4" />
              ) : (
                'app icon'
              )}
              {row.getValue('name')}
            </div>
          )
        },
      },
      {
        accessorKey: 'Characters',
        header: 'characters',
      },
      {
        accessorKey: 'update_at',
        header: 'Update Time',
        cell: ({ row }) => new Date(row.getValue('update_at')).toLocaleString(),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue('status')
          const text =
            status === 0 ? 'Available' : status === 1 ? 'Indexing' : 'Error'
          return (
            <div
              className={cn(
                'text-right',
                status === 0
                  ? 'text-green-600'
                  : status === 2
                  ? 'text-red-600'
                  : 'text-black'
              )}
            >
              {text}
            </div>
          )
        },
      },
      {
        accessorKey: 'id',
        header: '',
        cell: ({ row }) => {
          const { status, type, uid } = row.original
          return (
            <div className="invisible z-10 flex gap-2 group-hover/cell:visible">
              {status === 0 && (
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={(e) => {
                    currentUid.current.uid = uid
                    e.preventDefault()
                    editData(uid)
                  }}
                >
                  {isPending && currentUid?.current?.uid === uid ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileType2 size={18} />
                  )}
                </Button>
              )}
              {status === 0 && type !== 'pdf' && (
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <RefreshCcw size={18} />
                </Button>
              )}

              <DeleteData datasetId={dataset_id} uid={uid} />
            </div>
          )
        },
      },
    ],
    [dataset_id, editData, isPending]
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
        router.push(`/dataset/${dataset_id}/segment`)
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

  return (
    <div className="space-y-8">
      <GenericFilter
        value={queries}
        content={filters}
        onChange={handleFilterChange}
      />
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
    </div>
  )
}

export default DatasetTable
