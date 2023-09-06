'use client'

import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import useSWR from 'swr'

import { cn, fetcher } from '@/lib/utils'
import { DataTable } from '@/components/ui/table/data-table'
import { DataTablePagination } from '@/components/ui/table/pagination'
import GenericFilter, { GenericFilterType } from '@/components/generic-filter'
import { PdfImage } from '@/components/upload/component'

import { DataProps } from './utils'

const DatasetTable = () => {
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
      // fallbackData: preloaded,
      keepPreviousData: true,
    }
  )

  console.log(data, '----data', isValidating)
  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Data Name',
        cell: ({ row }) => {
          console.log(row, '--row')
          return (
            <div className="flex gap-1">
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
          const value = row.getValue<{
            status: number
          }>('')
          return <div>actions</div>
        },
      },
    ],
    []
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
        // onRowClick={handleRowClick}
      />
      <DataTablePagination table={table} />
    </div>
  )
}

export default DatasetTable
