import { Button } from '@/components/ui/button'
import SidebarLayout from '@/components/sidebar-layout'

import CategoriesSidebar from '../../components/sidebar-categories'
import AppLists from '../app/app-list'
import FeaturedList from './featured-list'

export default async function ExplorePage() {
  return (
    <SidebarLayout
      sidebar={<CategoriesSidebar />}
      mainClassName="overflow-hidden"
    >
      <div className="flex h-full w-full flex-col">
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-6 py-1 text-base font-medium leading-[48px]">
            Explore
          </div>
          <div className="h-[1px] w-full bg-slate-100 " />
          <FeaturedList />
        </div>
        <div className="flex flex-1 overflow-y-auto">
          <AppLists />
        </div>
      </div>
    </SidebarLayout>
  )
}
