import { UniqueIdentifier } from '@dnd-kit/core'
import { VideoIcon, WrenchIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { TreeItem } from '@/components/dnd/types'
import { SUB_TYPE_MAP } from '@/app/(manage)/app/[app_id]/settings/workflow/const'

import { useWorkflowContext } from './store'

interface IProps {
  id: UniqueIdentifier
  labelKey?: string
  childItems?: TreeItem[]
  onSelect: (taskId: UniqueIdentifier) => void
  selectedId: UniqueIdentifier | null
}

export default function TaskItem({
  id,
  labelKey,
  childItems,
  onSelect,
  selectedId,
}: IProps) {
  const isSelected = id === selectedId

  const workflowData = useWorkflowContext((state) => state.workflowData)
  const value = workflowData.find((d) => d.id === id)

  const title =
    SUB_TYPE_MAP[value?.subType as keyof typeof SUB_TYPE_MAP]?.title ?? ''
  const video = JSON.parse(value?.formValueStr || '')?.video
    ?.enable_video_interaction

  return (
    <div className="pl-12 pt-4">
      <button
        className={cn(
          'w-[360px] rounded-lg border border-slate-200 px-4 pb-6 pt-3 text-start hover:bg-slate-50',
          isSelected && 'border-blue-500 bg-slate-50'
        )}
        onClick={() => onSelect(id)}
      >
        <div className="flex items-center space-x-2 text-slate-500">
          <WrenchIcon />
          <div className="text-sm">Tools</div>
          {labelKey && (
            <Badge variant="secondary" className="h-5">
              {labelKey}
            </Badge>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-900">{title}</div>
          {video && <VideoIcon className="shrink-0 text-green-600" />}
        </div>
      </button>
      {childItems &&
        childItems.length > 0 &&
        childItems.map(({ id, children }) => (
          <TaskItem
            key={id}
            id={id}
            childItems={children}
            onSelect={onSelect}
            selectedId={selectedId}
          />
        ))}
    </div>
  )
}
