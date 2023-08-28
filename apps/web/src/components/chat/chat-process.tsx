import { useState } from 'react'
import { Zap, ZapOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '../ui/button'
import { useChatContext } from './chat-context'

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
        content
      </div>
    </div>
  )
}
