'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AppSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const { app_id: appId } = params

  // const [isPending, startTransition] = React.useTransition()
  // console.log('isPending:', isPending)

  async function handleAdd() {
    try {
      const result = await fetch('/api/app', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New App',
          description: 'New App Description',
          icon: '',
        }),
      })
      const json = await result.json()
      console.log('handleAdd json:', json)
    } catch (error) {
      console.log('handleAdd error:', error)
    }
  }

  return (
    <>
      <div className="group relative mt-6 flex shrink-0 items-center justify-center">
        <Link href="/">
          <Avatar
            className={cn(
              'h-12 w-12 rounded-3xl bg-white transition-all group-hover:rounded-2xl',
              pathname === '/explore' && 'rounded-2xl'
            )}
          >
            <AvatarImage src="https://github.com/withcontext-ai.png" />
            <AvatarFallback>CO</AvatarFallback>
          </Avatar>
        </Link>
        <div
          className={cn(
            'absolute left-0 top-1/2 h-0 w-1 -translate-x-2 -translate-y-1/2 rounded-r-sm bg-white transition-all group-hover:h-5 group-hover:translate-x-0',
            pathname === '/explore' && 'h-10 translate-x-0 group-hover:h-10'
          )}
        />
      </div>
      <div className="m-auto mt-6 h-px w-14 bg-slate-200" />
      <nav className="flex-1 overflow-y-auto py-6 scrollbar-none">
        <ul role="list" className="flex flex-col space-y-4">
          {/* {[...Array(10)].map((_, i) => (
            <li key={i} className="group relative flex justify-center">
              <Link href={`/app/a${i}`}>
                <Avatar
                  className={cn(
                    'h-12 w-12 rounded-3xl bg-white transition-all group-hover:rounded-2xl',
                    appId === `a${i}` && 'rounded-2xl'
                  )}
                >
                  <AvatarFallback>A{i}</AvatarFallback>
                </Avatar>
              </Link>
              <div
                className={cn(
                  'absolute left-0 top-1/2 h-0 w-1 -translate-x-2 -translate-y-1/2 rounded-r-sm bg-white transition-all group-hover:h-5 group-hover:translate-x-0',
                  appId === `a${i}` && 'h-10 translate-x-0 group-hover:h-10'
                )}
              />
            </li>
          ))} */}
          <li className="flex justify-center">
            <Avatar className="h-12 w-12 cursor-pointer" onClick={handleAdd}>
              <AvatarFallback className=" bg-white">
                <Plus />
              </AvatarFallback>
            </Avatar>
          </li>
        </ul>
      </nav>
    </>
  )
}
