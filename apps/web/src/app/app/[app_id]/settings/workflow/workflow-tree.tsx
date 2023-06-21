'use client'

import { SortableTree } from '@/components/dnd/sortable-tree'
import { TreeItem } from '@/components/dnd/types'

import WorkflowTreeItem from './workflow-tree-item'

interface IProps {
  defaultValue?: TreeItem[]
  onChange?: (items: TreeItem[]) => void
}

export default function WorkflowTree({ defaultValue = [], onChange }: IProps) {
  function handleChange(items: TreeItem[]) {
    onChange?.(items)
  }

  return (
    <SortableTree
      value={defaultValue}
      onChange={handleChange}
      indicator
      removable
    >
      {(props) => <WorkflowTreeItem key={props.id} {...props} />}
    </SortableTree>
  )
}
