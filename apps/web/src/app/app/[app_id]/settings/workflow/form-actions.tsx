'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'
import { useSettingsStore, WorkflowItem } from '@/store/settings'
import { Button } from '@/components/ui/button'
import { TreeItem } from '@/components/dnd/types'

function editApp(
  url: string,
  {
    arg,
  }: {
    arg: {
      name?: string
      description?: string
      icon?: string
      workflow_tree_str?: string
      workflow_data_str?: string
    }
  }
) {
  return fetcher(url, {
    method: 'PATCH',
    body: JSON.stringify(arg),
  })
}

function useAutoSave(key: string, value: any, canSave: boolean) {
  const { app_id } = useParams()
  const { trigger } = useSWRMutation(`/api/apps/${app_id}`, editApp)

  const valueStr = JSON.stringify(value)
  const latestValueStrRef = React.useRef(JSON.stringify(valueStr))

  React.useEffect(() => {
    if (canSave && valueStr !== latestValueStrRef.current) {
      console.log('saving data:', key, valueStr)
      trigger({ [key]: valueStr })
      latestValueStrRef.current = JSON.stringify(valueStr)
    }
  }, [canSave, trigger, key, valueStr])
}

interface IProps {
  defaultWorkflowTree: TreeItem[]
  defaultWorkflowData: WorkflowItem[]
}

export default function FormActions({
  defaultWorkflowTree,
  defaultWorkflowData,
}: IProps) {
  const initWorkflow = useSettingsStore((state) => state.initWorkflow)
  const isWorkflowInitialized = useSettingsStore(
    (state) => state.isWorkflowInitialized
  )

  React.useEffect(() => {
    initWorkflow(defaultWorkflowTree, defaultWorkflowData)
  }, [initWorkflow, defaultWorkflowTree, defaultWorkflowData])

  const workflowTree = useSettingsStore((state) => state.workflowTree)
  const workflowData = useSettingsStore((state) => state.workflowData)

  useAutoSave('workflow_tree_str', workflowTree, isWorkflowInitialized)
  useAutoSave('workflow_data_str', workflowData, isWorkflowInitialized)

  return (
    <div className="fixed bottom-4 left-[276px] mx-4">
      <div className="flex h-18 w-[600px] max-w-md items-center justify-end space-x-2 rounded-lg border border-slate-100 bg-background px-4 shadow-md lg:max-w-lg xl:max-w-xl 2xl:max-w-full">
        <Button type="button" variant="ghost">
          Reset
        </Button>
        <Button type="submit">Publish</Button>
      </div>
    </div>
  )
}
