'use client'

import { SortableTree } from '@/components/dnd/SortableTree'
import { TreeItem } from '@/components/dnd/types'

interface IProps {
  defaultValue?: TreeItem[]
}

export default function WorkflowTree({ defaultValue }: IProps) {
  function handleChange(items: TreeItem[]) {
    console.log('items:', items)
  }

  return (
    <SortableTree
      value={defaultValue}
      onChange={handleChange}
      indicator
      removable
    >
      {(props) => (
        <div className="relative w-80" {...props.handleProps}>
          id: {props.id}
          {props.clone && props.childCount && props.childCount > 1 ? (
            <span className="absolute right-[-10px] top-[-10px] flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {props.childCount}
            </span>
          ) : null}
        </div>
      )}
    </SortableTree>
  )
}
