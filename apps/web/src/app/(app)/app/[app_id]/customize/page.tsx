import { useState } from 'react'
import { GitForkIcon } from 'lucide-react'

import { cn, safeParse } from '@/lib/utils'
import { NewApp } from '@/db/apps/schema'
import { Button } from '@/components/ui/button'
import CreateAppDialog from '@/components/create-app-dialog'

import { WorkflowItem } from '../(manage)/settings/workflow/type'

interface IProps {
  isAdmin?: boolean
  isOwner?: boolean
  appDetail?: NewApp
}

const Customize = async (props: IProps) => {
  const { isAdmin, isOwner, appDetail } = props

  const [defaultValues, setDefaultValues] = useState(appDetail)
  const {
    name,
    description,
    icon,
    published_workflow_data_str,
    published_workflow_tree_str,
    workflow_data_str,
    workflow_tree_str,
  } = defaultValues as NewApp

  const filterTemplateData = (data: WorkflowItem[]) => {
    const template = data?.reduce((m: WorkflowItem[], item: WorkflowItem) => {
      const formValueStr = JSON.parse(item?.formValueStr)
      if (formValueStr?.llm?.api_key) {
        formValueStr.llm.api_key = ''
      }
      if (formValueStr?.data?.datasets?.length) {
        formValueStr.data.datasets = []
      }
      m.push({ ...item, formValueStr })
      return m
    }, [])
    return JSON.stringify(template)
  }
  const createTemplateApp = async () => {
    const _defaultPublishedWorkflowTree = safeParse(
      published_workflow_tree_str,
      []
    )
    const _defaultPublishedWorkflowData = safeParse(
      published_workflow_data_str,
      []
    )
    const defaultPublishedWorkflowData = filterTemplateData(
      _defaultPublishedWorkflowData
    )

    // get filter template data
    // setDefaultValues({
    //   ...defaultValues,
    //   published_workflow_data_str: defaultPublishedWorkflowData,
    // })
  }
  return (
    <div className={cn(!isAdmin && !isOwner ? 'block' : 'hidden')}>
      <CreateAppDialog
        defaultValues={defaultValues}
        isCopy
        submit={createTemplateApp}
        dialogTrigger={
          <Button
            className="h-11 w-full justify-start gap-2 rounded-lg p-0 px-2 hover:bg-slate-200"
            variant="ghost"
            type="button"
          >
            <GitForkIcon size="20" />
            Customize
          </Button>
        }
      />
    </div>
  )
}

export default Customize
