import SidebarLayout from '@/components/sidebar-layout'

import ExploreSidebar from '../../components/sidebar-categories'
import AppLists from '../app/app-list'
import FeaturedList from './featured-list'

export default async function ExplorePage() {
  return (
    <SidebarLayout sidebar={<ExploreSidebar />}>
      <div className="flex flex-col">
        <div>
          <div className="px-6 py-3 text-base	font-medium leading-6	">
            Explore
          </div>
          <div className="h-[1px] w-full bg-slate-100 " />
          <FeaturedList />
        </div>
        <AppLists />
      </div>
    </SidebarLayout>
  )
}
