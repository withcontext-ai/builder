'use client'

import { useSettingsStore } from '@/store/settings'

import WorkflowTree from './workflow-tree'

export default function TaskList() {
  const isWorkflowInitialized = useSettingsStore(
    (state) => state.isWorkflowInitialized
  )
  const workflowTree = useSettingsStore((state) => state.workflowTree)
  const setWorkflowTree = useSettingsStore((state) => state.setWorkflowTree)
  const workflowData = useSettingsStore((state) => state.workflowData)

  console.log('workflowTree:', workflowTree)
  console.log('workflowData:', workflowData)

  if (!isWorkflowInitialized) return null

  return (
    <WorkflowTree
      value={workflowTree}
      onChange={setWorkflowTree}
      data={workflowData}
    />
  )
}
