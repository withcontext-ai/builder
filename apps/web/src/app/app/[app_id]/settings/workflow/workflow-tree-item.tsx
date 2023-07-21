'use client'

import { TrashIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useSettingsStore, WorkflowItem } from '@/store/settings'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { SUB_TYPE_MAP, TYPE_MAP } from './const'

interface IProps {
  id: string
  value?: WorkflowItem
  clone?: boolean
  ghost?: boolean
  childCount?: number
  handleProps?: any
  isDragValid?: boolean
}

export default function WorkflowTreeItem({
  id,
  value,
  clone,
  ghost,
  childCount,
  handleProps,
  isDragValid,
}: IProps) {
  const selectedTaskId = useSettingsStore((state) => state.selectedTaskId)
  const selectTask = useSettingsStore((state) => state.selectTask)
  const removeTask = useSettingsStore((state) => state.removeTask)

  const isSelected = selectedTaskId === id

  const { type, subType } = value || {}

  const typeTitle = type ? TYPE_MAP[type]?.title : ''
  const TypeIcon = type ? TYPE_MAP[type]?.icon : null
  // @ts-ignore
  const subTypeTitle = subType ? SUB_TYPE_MAP[subType]?.title : ''

  return (
    <div className={cn('relative mb-4 w-[360px]', clone && '-rotate-3')}>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border bg-white p-4 pb-6',
          isSelected && 'border-blue-500',
          ghost && isDragValid && 'border-gray-100',
          ghost && !isDragValid && 'border-red-100'
        )}
        {...handleProps}
        onClick={() => selectTask(id)}
      >
        <div className="flex space-x-2">
          {TypeIcon && <TypeIcon className="h-6 w-6" />}
          <div className="text-sm text-slate-500">{typeTitle}</div>
        </div>
        <div className="mt-3 text-sm font-medium text-slate-900">
          {subTypeTitle}
        </div>
        {ghost && (
          <div
            className={cn(
              'absolute inset-0',
              isDragValid ? 'bg-gray-100' : 'bg-red-100'
            )}
          />
        )}
      </div>
      {clone && childCount && childCount > 1 ? (
        <span className="absolute right-[-10px] top-[-10px] flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {childCount}
        </span>
      ) : null}
      {isSelected && !ghost && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="absolute -right-10 top-0">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader className="min-w-0">
              <AlertDialogTitle className="break-words">
                Delete Card?
              </AlertDialogTitle>
              <AlertDialogDescription className="break-words">
                Are you sure you want to delete “{subTypeTitle}” card? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={() => removeTask(id)}>
                Delete Card
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
