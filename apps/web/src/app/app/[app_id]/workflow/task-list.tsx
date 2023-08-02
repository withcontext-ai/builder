'use client'

import * as React from 'react'
import { UniqueIdentifier } from '@dnd-kit/core'
import { useWindowSize } from 'usehooks-ts'

import { Sheet, SheetContent } from '@/components/ui/sheet'

import { DatasetProps } from './page'
import { useWorkflowContext } from './store'
import TaskDetail from './task-detail'
import TaskItem from './task-item'

export default function TaskList({ datasets }: { datasets?: DatasetProps[] }) {
  const workflowTree = useWorkflowContext((state) => state.workflowTree)
  const selectedTaskId = useWorkflowContext((state) => state.selectedTaskId)
  const selectTask = useWorkflowContext((state) => state.selectTask)
  const selectedTask = useWorkflowContext((state) =>
    state.workflowData.find((d) => d.id === state.selectedTaskId)
  )

  function onSelectTask(id: UniqueIdentifier) {
    selectTask(id)
  }

  function closeTaskDetail() {
    selectTask(null)
  }

  const { width } = useWindowSize()
  const isSmallScreen = width < 1024

  return (
    <div className="flex flex-1">
      <div className="flex-1">
        <div className="-ml-6 mt-2">
          {workflowTree.map(({ id, children }) => (
            <TaskItem
              key={id}
              id={id}
              childItems={children}
              onSelect={onSelectTask}
              selectedId={selectedTaskId}
            />
          ))}
        </div>
      </div>
      {selectedTaskId && (
        <div className="hidden w-96 border-l border-slate-100 p-6 lg:block">
          <TaskDetail
            value={selectedTask}
            onClose={closeTaskDetail}
            datasets={datasets}
          />
        </div>
      )}
      {isSmallScreen && (
        <Sheet
          open={!!selectedTaskId}
          onOpenChange={(open) => {
            if (!open) selectTask(null)
          }}
        >
          <SheetContent side="bottom" className="min-h-[80vh]">
            <TaskDetail value={selectedTask} onClose={closeTaskDetail} />
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
