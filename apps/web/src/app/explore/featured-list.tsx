'use client'

import { ReactNode, useEffect } from 'react'
import { useExploreStore } from '@/store/explore'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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

interface IProps {
  defaultValue?: { id: string; title: string; icon: ReactNode }[]
}

export default function FeaturedList({ defaultValue }: IProps) {
  const selectedCategoryId = useExploreStore(
    (state) => state.selectedCategoryId
  )
  const setSelectedCategoryId = useExploreStore(
    (state) => state.setSelectedCategoryId
  )
  const resetState = useExploreStore((state) => state.resetState)

  const handleClickBuilder = (id: string) => {
    // e.preventDefault()
    console.log(id, '---click')
    id && setSelectedCategoryId(id)
  }

  useEffect(() => {
    return () => {
      resetState()
    }
  }, [resetState])

  return (
    <div className="mx-4 mt-4 flex w-[680px] gap-1 rounded-[3px] bg-slate-100 px-3 py-[3px] text-sm">
      {FEATURED_LIST_DATA?.map((item) => {
        return (
          <Button
            className={cn(
              'border-0 text-slate-700 hover:bg-white hover:text-slate-900',
              selectedCategoryId === item?.id ? 'bg-white' : 'bg-slate-100'
            )}
            key={item?.id}
            variant="outline"
            onClick={() => handleClickBuilder(item?.id)}
          >
            {item?.title}
          </Button>
        )
      })}
    </div>
  )
}
