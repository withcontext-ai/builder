'use client'

import { useSettingsStore } from '@/store/settings'

import TaskItemConversationalRetrievalQA from './task-item-conversational-retrieval-qa'

export default function TaskDetail() {
  const selectedTask = useSettingsStore((state) =>
    state.workflowData.find((d) => d.id === state.selectedTaskId)
  )

  if (!selectedTask) return null

  console.log('selectedTask:', selectedTask)

  switch (selectedTask.subType) {
    case 'conversational-retrieval-qa':
      return <TaskItemConversationalRetrievalQA />
    default:
      return null
  }
}
