import { ColumnDef, useReactTable } from '@tanstack/react-table'

import { getApp } from '@/db/apps/actions'
import { getSessions } from '@/db/sessions/actions'
import { Session } from '@/db/sessions/schema'

interface IProps {
  params: {
    app_id: string
  }
}

export default async function Page({ params }: IProps) {
  const { app_id } = params

  const appDetail = await getApp(app_id)

  const sessions = await getSessions(app_id)

  const columns: ColumnDef<Session>[] = [
    {
      accessorKey: 'created_at',
      header: 'Time',
    },
    {
      accessorKey: 'created_by',
      header: 'User Email',
    },
    {
      accessorKey: 'id',
      header: 'Conversation ID',
    },
  ]

  return (
    <div className="mx-14 mt-18 w-[530px]">

    </div>
  )
}
