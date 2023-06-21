'use client'

import { useSettingsStore } from '@/store/settings'

import WorkflowTree from './workflow-tree'

export default function TaskList() {
  const workflowTree = useSettingsStore((state) => state.workflowTree)
  const setWorkflowTree = useSettingsStore((state) => state.setWorkflowTree)
  console.log('workflowTree:', workflowTree)

  return <WorkflowTree defaultValue={workflowTree} onChange={setWorkflowTree} />
}
