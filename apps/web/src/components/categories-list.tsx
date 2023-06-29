'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, Database, Globe } from 'lucide-react'

import { cn } from '@/lib/utils'

const CateGories = [
  {
    name: 'Explore',
    href: '/explore',
    icon: <Globe size={20} />,
  },
  {
    name: 'My Apps',
    href: '/my',
    icon: <Box size={20} />,
  },
  {
    name: 'Datasets',
    href: '/datasets',
    icon: <Database size={20} />,
  },
]

const CategoriesList = () => {
  const selected = usePathname()
  return (
    <div className="flex-1 overflow-y-auto px-1 py-3">
      {CateGories?.map((item) => {
        return (
          <Link
            key={item?.name}
            href={item?.href}
            className={cn(
              'flex items-center gap-2 p-3 hover:rounded-sm hover:bg-slate-200',
              selected === item?.href ? 'bg-slate-200' : 'bg-white'
            )}
          >
            {item?.icon} {item?.name}
          </Link>
        )
      })}
    </div>
  )
}

export default CategoriesList
