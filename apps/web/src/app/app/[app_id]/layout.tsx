import { Suspense } from 'react'

import { getApp } from '@/db/apps/actions'
import { getSessions } from '@/db/sessions/actions'
import { Skeleton } from '@/components/ui/skeleton'
import AppLayout from '@/components/layouts/app-layout'
import ResponsiveLayout from '@/components/layouts/responsive-layout'

import Sidebar from './sidebar'

// TODO: remove axios
// export const runtime = 'edge'

interface IProps {
  children: React.ReactNode
  params: { app_id: string; session_id: string }
}

export default async function Layout({ children, params }: IProps) {
  const { app_id } = params
  return (
    <AppLayout>
      <ResponsiveLayout sidebar={<Sidebar appId={app_id} />}>
        {children}
      </ResponsiveLayout>
    </AppLayout>
  )
}
