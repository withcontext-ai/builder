'use client'

import { ReactNode } from 'react'
import { flexRender, Table as TableType } from '@tanstack/react-table'
import { Loader2 } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table'

interface DataTableProps<TData> {
  table: TableType<TData>
  isLoading?: boolean
  onRowClick?: (row: TData) => () => void
  noDataChildren?: ReactNode
  colSpan?: number
}

export function DataTable<TData>({
  table,
  isLoading,
  onRowClick,
  noDataChildren,
  colSpan,
}: DataTableProps<TData>) {
  return (
    <div className="relative rounded-md border">
      {isLoading && (
        <div className="absolute flex h-full w-full items-center justify-center rounded-md bg-white/80">
          <Loader2 className="animate-spin" />
        </div>
      )}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="group/cell cursor-pointer"
                key={row.id}
                onClick={onRowClick?.(row.original)}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={colSpan || 0} className="h-24 text-center">
                {noDataChildren || 'No results.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
