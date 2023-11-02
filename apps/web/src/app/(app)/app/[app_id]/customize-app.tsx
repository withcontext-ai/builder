'use client'

import { useState } from 'react'
import { useModal } from '@ebay/nice-modal-react'
import { omit } from 'lodash'
import { GitForkIcon } from 'lucide-react'

import { cn, safeParse } from '@/lib/utils'
import { NewApp } from '@/db/apps/schema'
import { Button } from '@/components/ui/button'
import CreateAppDialog from '@/components/create-app-dialog'

import { WorkflowItem } from './(manage)/settings/workflow/type'

interface IProps {
  isAdmin?: boolean
  isOwner?: boolean
  appDetail?: NewApp
}

const CustomizeApp = (props: IProps) => {
  const { isAdmin, isOwner, appDetail } = props
  const _defaultValues = omit(appDetail, [
    'api_model_id',
    'id',
    'short_id',
    'created_at',
    'updated_at',
    'created_by',
  ])
  const [defaultValues, setDefaultValues] = useState(_defaultValues)
  const {
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
    const defaultWorkflowTree = filterTemplateData(
      safeParse(workflow_tree_str, [])
    )
    const defaultWorkflowData = filterTemplateData(
      safeParse(workflow_data_str, [])
    )
    const defaultPublishedWorkflowTree = filterTemplateData(
      safeParse(published_workflow_tree_str, [])
    )
    const defaultPublishedWorkflowData = filterTemplateData(
      safeParse(published_workflow_data_str, [])
    )

    // get filter template data
    setDefaultValues({
      ...defaultValues,
      published_workflow_data_str: defaultPublishedWorkflowData,
      published_workflow_tree_str: defaultPublishedWorkflowTree,
      workflow_data_str: defaultWorkflowData,
      workflow_tree_str: defaultWorkflowTree,
    })
  }
  const modal = useModal(CreateAppDialog)

  return (
    <div className={cn(!isAdmin && !isOwner ? 'block' : 'hidden')}>
      <Button
        className="h-11 w-full justify-start gap-2 rounded-lg p-0 px-2 hover:bg-slate-200"
        variant="ghost"
        type="button"
        onClick={() =>
          modal.show({ defaultValues, isCopy: true, submit: createTemplateApp })
        }
      >
        <GitForkIcon size="20" />
        Customize
      </Button>
    </div>
  )
}

export default CustomizeApp
