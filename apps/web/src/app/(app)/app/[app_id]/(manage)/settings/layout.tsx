import { redirect } from 'next/navigation'

import { getApp } from '@/db/apps/actions'
import { checkOwnership } from '@/utils/permission'
import ManageLayout from '@/components/layouts/manage-layout'

import Sidebar from './sidebar'

export const runtime = 'edge'

interface IProps {
  children: React.ReactNode
  params: { app_id: string }
}

export default async function Layout({ children, params }: IProps) {
  const { app_id } = params
  const appDetail = await getApp(app_id)

  if (!checkOwnership(appDetail.created_by)) {
    redirect('/')
  }

  return (
    <ManageLayout sidebar={<Sidebar appId={app_id} appName={appDetail.name} />}>
      {children}
    </ManageLayout>
  )
}
