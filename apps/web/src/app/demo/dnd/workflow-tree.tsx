'use client'

import { UniqueIdentifier } from '@dnd-kit/core'

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
      {(id: UniqueIdentifier) => <div>id: {id}</div>}
    </SortableTree>
  )
}
