import SidebarLayout from '@/components/sidebar-layout'

import AppLists from '../app/app-list'
import ExploreSidebar from './sidebar'

export default async function ExplorePage() {
  return (
    <SidebarLayout sidebar={<ExploreSidebar />}>
      <AppLists />
    </SidebarLayout>
  )
}
