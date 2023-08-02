import { safeParse } from '@/lib/utils'
import { getApp } from '@/db/apps/actions'
import { getDatasets } from '@/db/datasets/actions'

import { WorkflowProvider } from './store'
import TaskList from './task-list'

interface IProps {
  params: { app_id: string }
}

export interface DatasetProps {
  name?: string
  icon?: string
  dataset_id?: string
}

export default async function Page({ params }: IProps) {
  const { app_id } = params
  const appDetail = await getApp(app_id)
  const { published_workflow_tree_str, published_workflow_data_str } = appDetail
  const workflowTree = safeParse(published_workflow_tree_str, [])
  const workflowData = safeParse(published_workflow_data_str, [])
  const datasets = await getDatasets()
  const data = datasets.map((d) => {
    return {
      icon: (d.config as any).loaderType || 'pdf',
      name: d.name,
      dataset_id: d.api_dataset_id,
    }
  })
  return (
    <WorkflowProvider
      workflowTree={workflowTree}
      workflowData={workflowData}
      // selectedTaskId={workflowTree[0]?.id ?? null}
      selectedTaskId={null}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center justify-between px-6">
          <h1>Workflow</h1>
        </div>
        <div className="h-px w-full shrink-0 bg-slate-100" />
        <TaskList datasets={data} />
      </div>
    </WorkflowProvider>
  )
}
