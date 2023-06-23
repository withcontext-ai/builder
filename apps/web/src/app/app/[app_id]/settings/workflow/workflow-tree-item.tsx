'use client'

import { WorkflowItem } from '@/store/settings'

interface IProps {
  id: string
  clone?: boolean
  childCount?: number
  handleProps?: any
  value?: WorkflowItem
}

export default function WorkflowTreeItem({
  id,
  clone,
  childCount,
  handleProps,
  value,
}: IProps) {
  const { type, subType, name } = value || {}

  function handleClick() {
    console.log('handleClick WorkflowTreeItem:', id)
  }

  return (
    <div
      className="relative mb-4 w-[360px] rounded-lg border bg-white p-4"
      {...handleProps}
      onClick={handleClick}
    >
      <div className="text-sm text-slate-500">{type}</div>
      <div className="mt-3 text-sm font-medium text-slate-900">{name}</div>
      {clone && childCount && childCount > 1 ? (
        <span className="absolute right-[-10px] top-[-10px] flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {childCount}
        </span>
      ) : null}
    </div>
  )
}
