import { Wrench } from 'lucide-react'
import useSWR from 'swr'

import { cn, fetcher } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { useChatContext } from './chat-context'

const PROCESS_DATA = [
  {
    status: 'failed',
    name: 'Self Checking',
    key: 'tool-0',
  },
  {
    status: 'success',
    name: 'Self Checking Self Checking Self Checking Self Checking',
    key: 'tool-1',
  },
  {
    status: 'waiting',
    name: 'Self Checking',
    key: 'tool-2',
  },
]

const ChatProcess = () => {
  const { session } = useChatContext()
  const { api_session_id } = session

  // TODO: use the data from the API
  const { data, isLoading } = useSWR(
    `/api/chat/process?api_session_id=${api_session_id}`,
    fetcher,
    {
      refreshInterval: 10 * 1000,
    }
  )

  return (
    <div>
      <div className="p-6 text-base font-medium uppercase text-slate-500">
        Process
      </div>
      <div className="flex flex-col gap-2 pl-4 pr-1">
        {PROCESS_DATA.map((item) => (
          <div key={item?.key} className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1 hover:cursor-pointer">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      item?.status === 'failed'
                        ? ' bg-red-500'
                        : item?.status === 'success'
                        ? 'bg-green-500'
                        : 'bg-slate-400'
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{item?.status}</p>
              </TooltipContent>
            </Tooltip>

            <div
              className={cn(
                'flex items-center gap-2 truncate rounded-sm border border-slate-100 p-2 text-base',
                item?.status === 'waiting' ? 'text-slate-400' : 'text-slate-900'
              )}
            >
              <Wrench className="shrink-0" />
              <p className="truncate">{item?.name}</p>
              <Badge
                variant="secondary"
                className={cn(
                  'shrink-0',
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
  )
}

export default ChatProcess
