'use client'

import { SortableTree } from '@/components/dnd/SortableTree'
import { MenuItem } from '@/components/dnd/types'

interface IProps {
  defaultValue?: MenuItem[]
}

export default function WorkflowTree({ defaultValue }: IProps) {
  function handleChange(items: MenuItem[]) {
    console.log('items:', items)
  }

  return (
    <SortableTree
      value={defaultValue}
      onChange={handleChange}
      indicator
      removable
    />
  )
}
