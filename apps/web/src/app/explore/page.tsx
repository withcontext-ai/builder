// 'use client'

// import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import SidebarLayout from '@/components/sidebar-layout'

import AppLists from '../app/app-list'
import FeaturedList from './featured-list'
import ExploreSidebar from './sidebar'

const FEATURED_LIST_DATA = [
  {
    id: 'all',
    title: 'All Categories',
  },
  {
    id: 'hr',
    title: 'Human Resources',
  },
  {
    id: 'tr',
    title: 'Translation',
  },
  {
    id: 'kb',
    title: 'Knowledge Base',
  },
  {
    id: 'st',
    title: 'Self Training',
  },
]

export default async function ExplorePage() {
  // const [selected, setSelected] = useState<string>('all')
  const selected = 'all'
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
