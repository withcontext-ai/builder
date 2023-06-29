'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Plus } from 'lucide-react'
import useSWR from 'swr'

import { cn, fetcher, getAvatarBgColor, getFirstLetter } from '@/lib/utils'
import { App } from '@/db/apps/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import CreateAppDialog from './create-app-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

interface IProps {
  appList?: App[]
}

export default function AppSidebar({ appList }: IProps) {
  const pathname = usePathname()
  const params = useParams()
  const { app_id: appId } = params

  const {
    isLoading,
    data: appListData,
    error,
    mutate,
  } = useSWR<App[]>('/api/me/apps', fetcher, {
    fallbackData: appList,
  })
  console.log('isLoading:', isLoading)
  console.log('data:', appListData)
  // console.log('error:', error)

  return (
    <>
      <div className="group relative mt-6 flex shrink-0 items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side="right">Explore</TooltipContent>
        </Tooltip>
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
          {appListData?.map((appItem) => {
            const isSelected = appId === appItem.short_id
            const color = getAvatarBgColor(appItem.short_id)
            return (
              <li
                key={appItem.short_id}
                className="group relative flex justify-center"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/app/${appItem.short_id}`}>
                      <Avatar
                        className={cn(
                          'h-12 w-12 rounded-3xl bg-white transition-all group-hover:rounded-2xl',
                          isSelected && 'rounded-2xl',
                          `bg-${color}-600`
                        )}
                      >
                        <AvatarImage src={appItem.icon} />
                        <AvatarFallback className="bg-transparent text-white">
                          {getFirstLetter(appItem.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{appItem.name}</TooltipContent>
                </Tooltip>
                <div
                  className={cn(
                    'absolute left-0 top-1/2 h-0 w-1 -translate-x-2 -translate-y-1/2 rounded-r-sm bg-white transition-all group-hover:h-5 group-hover:translate-x-0',
                    isSelected && 'h-10 translate-x-0 group-hover:h-10'
                  )}
                />
              </li>
            )
          })}
          <CreateAppDialog
            dialogTrigger={
              <li className="group flex justify-center">
                <Avatar className="h-12 w-12 cursor-pointer rounded-3xl bg-white transition-all group-hover:rounded-2xl">
                  <AvatarFallback className="bg-white">
                    <Plus />
                  </AvatarFallback>
                </Avatar>
              </li>
            }
          />
        </ul>
      </nav>
    </>
  )
}
