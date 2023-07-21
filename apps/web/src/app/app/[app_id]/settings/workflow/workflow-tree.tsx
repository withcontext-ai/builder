'use client'

import { WorkflowItem } from '@/store/settings'
import { UniqueIdentifier } from '@dnd-kit/core'

import { SortableTree } from '@/components/dnd/sortable-tree'
import { TreeItem } from '@/components/dnd/types'

import WorkflowTreeItem from './workflow-tree-item'

interface IProps {
  value?: TreeItem[]
  onChange?: (items: TreeItem[]) => void
  data?: WorkflowItem[]
}

export default function WorkflowTree({ value = [], onChange, data }: IProps) {
  function handleChange(items: TreeItem[]) {
    onChange?.(items)
  }

  function checkDragValid(parentId: UniqueIdentifier) {
    const parentItem = data?.find((d) => d.id === parentId)
    return parentItem?.type === 'agent'
  }

  return (
    <SortableTree
      value={value}
      onChange={handleChange}
      checkDragValid={checkDragValid}
      indicator
      removable
    >
      {(props) => {
        const value = data?.find((d) => d.id === props.id)
        return <WorkflowTreeItem key={props.id} value={value} {...props} />
      }}
    </SortableTree>
  )
}
