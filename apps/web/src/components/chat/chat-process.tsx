import * as React from 'react'
import { Wrench } from 'lucide-react'
import useSWR from 'swr'

import { cn, fetcher } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { SUB_TYPE_MAP } from '@/app/app/[app_id]/(manage)/settings/workflow/const'

import { useChatContext } from './chat-context'

interface IProcessItem {
  status: string
  name: string
  key: string
}

interface IProps {
  workflow: any[] // TODO: type
}

const ChatProcess = ({ workflow }: IProps) => {
  const { session } = useChatContext()
  const { api_session_id } = session

  const { data } = useSWR<IProcessItem[]>(
    `/api/chat/process?api_session_id=${api_session_id}`,
    fetcher,
    {
      revalidateOnMount: true,
      refreshInterval: 10 * 1000,
    }
  )

  console.log('data:', data)
  console.log('workflow:', workflow)

  const workflowWithStatus = React.useMemo(() => {
    return workflow.map((item: any) => {
      if (item.type === 'self_checking_chain') {
        const found = data?.find((d: any) => d.key === item?.key)
        return {
          ...item,
          ...found,
          hasStatus: true,
        }
      }
      return {
        ...item,
        hasStatus: false,
      }
    })
  }, [workflow, data])

  return (
    <div>
      <div className="p-6 text-base font-medium uppercase text-slate-500">
        Process
      </div>
      <div className="flex flex-col gap-2 pl-4 pr-1">
        {workflowWithStatus?.map((item) => (
          <div key={item?.key} className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-1">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      !item?.hasStatus && 'bg-slate-900',
                      item?.hasStatus && !item?.finished && 'bg-slate-400',
                      item?.hasStatus &&
                        item?.finished &&
                        item?.succeed &&
                        'bg-green-500',
                      item?.hasStatus &&
                        item?.finished &&
                        !item?.succeed &&
                        'bg-red-500'
                    )}
                  />
                </div>
              </TooltipTrigger>
              {item?.hasStatus && item?.finished && (
                <TooltipContent side="left">
                  {item?.succeed ? 'Succeed' : 'Failed'}
                </TooltipContent>
              )}
            </Tooltip>

            <div
              className={cn(
                'flex items-center gap-2 truncate rounded-sm border border-slate-100 p-2 text-base text-slate-900',
                item?.hasStatus && !item?.finished && 'text-slate-400'
              )}
            >
              <Wrench className="shrink-0" />
              <p className="truncate">
                {SUB_TYPE_MAP[item?.type as keyof typeof SUB_TYPE_MAP].title}
              </p>
              <Badge
                variant="secondary"
                className={cn(
                  'shrink-0 text-slate-900',
                  item?.hasStatus && !item?.finished && 'text-slate-400'
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
