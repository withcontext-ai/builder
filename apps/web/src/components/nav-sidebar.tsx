'use client'

import { usePathname } from 'next/navigation'
import { BoxIcon, GlobeIcon } from 'lucide-react'

import AuthButton from '@/components/auth-button'

import ExploreList from './explore-list'
import MineList from './mine-list'

export default function NavSidebar() {
  const pathname = usePathname()
  const isHome =
    ['/', '/explore'].includes(pathname) || pathname.includes('/explore/')
  return (
    <div className="flex w-60 shrink-0 grow flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <h1 className="flex h-12 shrink-0 items-center px-4 text-lg font-semibold">
          {isHome ? 'Explore' : 'My space'}
        </h1>
        <div className="m-full h-px shrink-0 bg-slate-200" />
        <div className="flex-1 px-2 py-3">
          <div className="space-y-3">
            <div className="space-y-3">
              {isHome ? <ExploreList /> : <MineList />}
            </div>
          </div>
        </div>
      </div>
      <AuthButton />
    </div>
  )
}
