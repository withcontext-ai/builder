'use client'

import { useCallback, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import useSWR from 'swr'

import { fetcher } from '@/lib/utils'
import { DataTable } from '@/components/ui/table/data-table'
import { DataTablePagination } from '@/components/ui/table/pagination'
import GenericFilter, { GenericFilterType } from '@/components/generic-filter'

async function getDatasetDocument(
  params: [dataset_name: string, pagination: Record<string, any>]
) {
  const [dataset_name, pagination] = params
  const search = new URLSearchParams({
    dataset_name,
    ...pagination,
  }).toString()

  return fetcher(``)
}

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

  const { data, isValidating } = useSWR<any>(
    [dataset_id, queries, pagination],
    getDatasetDocument,
    {
      // fallbackData: preloaded,
      keepPreviousData: true,
    }
  )
  const columns: ColumnDef<any['sessions'][number]>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Data Name',
        cell: ({ row }) => new Date(row.getValue('name')).toLocaleString(),
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
          return <div className="text-right">{row.getValue('status')}</div>
        },
      },
      {
        accessorKey: 'action',
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
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil((data?.count || 0) / pagination.pageSize),
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
