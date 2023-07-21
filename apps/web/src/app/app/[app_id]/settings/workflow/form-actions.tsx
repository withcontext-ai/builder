'use client'

import * as React from 'react'
import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'
import { useSettingsStore } from '@/store/settings'
import { Button } from '@/components/ui/button'

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

function useAutoSave(key: string, value: any) {
  const { app_id } = useParams()
  const { trigger } = useSWRMutation(`/api/apps/${app_id}`, editApp)

  const valueStr = JSON.stringify(value)
  const latestValueStrRef = React.useRef(valueStr)

  React.useEffect(() => {
    if (valueStr !== latestValueStrRef.current) {
      console.log('saving data:', key, valueStr)
      trigger({ [key]: valueStr })
    }
  }, [trigger, key, valueStr])
}

export default function FormActions() {
  const workflowTree = useSettingsStore((state) => state.workflowTree)
  const workflowData = useSettingsStore((state) => state.workflowData)

  useAutoSave('workflow_tree_str', workflowTree)
  useAutoSave('workflow_data_str', workflowData)

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
