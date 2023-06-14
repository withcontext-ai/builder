import { MenuItem } from '@/components/dnd/types'

import WorkflowTree from './workflow-tree'

const ITEMS_VALUE: MenuItem[] = [
  {
    id: 'a',
    name: 'aaa',
    type: 'page',
    value: 'https://www.baidu.com',
    children: [
      {
        id: 'b',
        name: 'bbb',
        type: 'page',
        value: 'https://www.baidu.com',
        children: [],
      },
    ],
  },
  {
    id: 'c',
    name: 'ccc',
    type: 'page',
    value: 'https://www.baidu.com',
    children: [],
  },
]

export default function DemoPage() {
  return (
    <div className="flex-1 p-4">
      <WorkflowTree defaultValue={ITEMS_VALUE} />
    </div>
  )
}
