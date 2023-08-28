import { useState } from 'react'
import { Wrench, Zap, ZapOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useChatContext } from './chat-context'

const Process = [
  {
    status: 'failed',
    name: 'Self Checking',
    key: 'tool-0',
  },
  {
    status: 'success',
    name: 'Self Checking',
    key: 'tool-1',
  },
  {
    status: 'waiting',
    name: 'Self Checking',
    key: 'tool-2',
  },
]

export const ProcessButton = () => {
  const { showProcess, setShowProcess } = useChatContext()
  return (
    <div className={cn('h-full w-full')}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => setShowProcess?.(!showProcess)}
          >
            {!showProcess ? <Zap size="16" /> : <ZapOff size="16" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{!showProcess ? 'Show process' : 'Hide process'}</p>
        </TooltipContent>
      </Tooltip>
      <div
        className={cn(
          'absolute right-0 top-[56px] h-[calc(100%-56px)] w-[380px] border-l p-6',
          showProcess ? 'block' : 'hidden'
        )}
      >
        <div className="mb-6 text-base font-medium text-slate-500">PROCESS</div>
        <div className="flex flex-col gap-2">
          {Process?.map((item) => (
            <div key={item?.key} className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full hover:cursor-pointer',
                      item?.status === 'failed'
                        ? ' bg-red-500'
                        : item?.status === 'success'
                        ? 'bg-green-500'
                        : 'bg-slate-400'
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item?.status}</p>
                </TooltipContent>
              </Tooltip>

              <div
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm border border-slate-100 p-2 text-base	',
                  item?.status === 'waiting'
                    ? 'text-slate-400'
                    : 'text-slate-900'
                )}
              >
                <Wrench />
                {item?.name}
                <Badge
                  variant="secondary"
                  className={cn(
                    'h-5',
                    item?.status === 'waiting'
                      ? 'text-slate-400'
                      : 'text-slate-900'
                  )}
                >
                  {item?.key}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
