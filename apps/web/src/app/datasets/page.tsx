import HomeSidebar from '@/components/home-sidebar'
import SidebarLayout from '@/components/sidebar-layout'

export default async function Page() {
  return (
    <SidebarLayout sidebar={<HomeSidebar />}>
      <div className="p-2">TODO: datasets</div>
    </SidebarLayout>
  )
}
