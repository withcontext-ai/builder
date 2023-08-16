'use client'

import { flags } from '@/lib/flags'

import BaseSideBar from '../sidebar'
import DeleteAppButton from './delete-app-button'

interface IProps {
  appId: string
  appName: string
}

export default function Sidebar({ appId, appName }: IProps) {
  return (
    <BaseSideBar>
      <div className="pl-3 text-sm font-medium uppercase text-slate-500">
        App Settings
      </div>

      <BaseSideBar.Link
        href={`/app/${appId}/settings/basics`}
        name="Basics"
        desc="Some basic configurations of the App."
      />
      {flags.enabledWorkflow && (
        <BaseSideBar.Link
          href={`/app/${appId}/settings/workflow`}
          name="Workflow"
          desc="Workflow related configurations of the App."
        />
      )}

      <div className="mb-2 shrink-0 px-3">
        <div className="h-px bg-slate-200" />
      </div>

      <DeleteAppButton id={appId} name={appName} />
    </BaseSideBar>
  )
}
