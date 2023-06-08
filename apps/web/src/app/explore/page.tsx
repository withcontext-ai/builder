import AddorEditTask from '@/components/file-task'
import SidebarLayout from '@/components/sidebar-layout'

import ExploreSidebar from './sidebar'

export default async function ExplorePage() {
  return (
    <SidebarLayout sidebar={<ExploreSidebar />}>
      <div className="h-96">
        <AddorEditTask />
      </div>
      <div className="h-96">Main area</div>
      <div className="h-96">Main area</div>
      <div className="h-96">Main area</div>
    </SidebarLayout>
  )
}
