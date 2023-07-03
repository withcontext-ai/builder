import { GlobeIcon, User2Icon, UserIcon } from 'lucide-react'

import AuthButton from '@/components/auth-button'

import FeaturedList from './featured-list'
import MineList from './mine-list'

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

export default async function HomeSidebar() {
  return (
    <>
      <h1 className="px-4 py-2 text-lg font-semibold">Context AI</h1>
      <div className="m-full h-px bg-slate-100" />
      <div className="flex-1 px-1 py-3">
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="flex items-center space-x-2 px-3">
              <User2Icon size={20} />
              <span>Mine</span>
            </h2>
            <MineList />
          </div>
          <div className="space-y-3">
            <h2 className="flex items-center space-x-2 px-3">
              <GlobeIcon size={20} />
              <span>Explore</span>
            </h2>
            <FeaturedList defaultValue={FEATURED_LIST_DATA} />
          </div>
        </div>
      </div>
      <div className="m-full h-px bg-slate-100" />
      <AuthButton />
    </>
  )
}
