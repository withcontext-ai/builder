import SidebarLayout from '@/components/sidebar-layout'
import TestUpload from '@/components/upload/test'

import ExploreSidebar from './sidebar'

export default async function ExplorePage() {
  return (
    <SidebarLayout sidebar={<ExploreSidebar />}>
      <div className="h-96">
        upload pdf: <TestUpload listType="pdf" />
      </div>
      <div className="h-96">
        upload image: <TestUpload listType="image" />
      </div>
      <div className="h-96">Main area</div>
      <div className="h-96">Main area</div>
    </SidebarLayout>
  )
}
