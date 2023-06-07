import { auth } from '@clerk/nextjs'

import AppLayout from '@/components/app-layout'
import AppSidebar from '@/components/app-sidebar'

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  return (
    <AppLayout sidebar={userId ? <AppSidebar /> : null}>{children}</AppLayout>
  )
}
