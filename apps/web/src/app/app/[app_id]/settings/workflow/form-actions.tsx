'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'

import { useWorkflowContext } from './store'

function editApp(
  url: string,
  {
    arg,
  }: {
    arg: {
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

function useAutoSave(key: string, value: any) {
  const { app_id } = useParams()
  const { trigger } = useSWRMutation(`/api/apps/${app_id}`, editApp)

  const latestValue = React.useRef(value)

  React.useEffect(() => {
    if (value !== latestValue.current) {
      console.log('saving data:', key, value)
      trigger({ [key]: value })
      latestValue.current = value
    }
  }, [trigger, key, value])
}

function AutoSave() {
  const workflowTree = useWorkflowContext((state) => state.workflowTree)
  const workflowData = useWorkflowContext((state) => state.workflowData)

  useAutoSave('workflow_tree_str', JSON.stringify(workflowTree))
  useAutoSave('workflow_data_str', JSON.stringify(workflowData))

  return null
}

export default function FormActions() {
  return (
    <>
      <div className="fixed bottom-4 left-[276px] mx-4">
        <div className="flex h-18 w-[600px] max-w-md items-center justify-end space-x-2 rounded-lg border border-slate-100 bg-background px-4 shadow-md lg:max-w-lg xl:max-w-xl 2xl:max-w-full">
          <Button type="button" variant="ghost">
            Reset
          </Button>
          <Button type="submit">Publish</Button>
        </div>
      </div>

      <AutoSave />
    </>
  )
}
