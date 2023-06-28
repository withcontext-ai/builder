'use client'

import { useState } from 'react'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import { ArrowLeftIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const commonStyle =
  'flex cursor-pointer flex-col rounded-md p-3 hover:bg-slate-100'

export default function Sidebar() {
  const { app_id: appId } = useParams()
  const [select, setSelected] = useState<number>(2)
  return (
    <div>
      <div className="flex items-center space-x-2 px-4 py-3">
        <Button variant="outline" className="h-8 w-8 p-0">
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div className="text-lg font-semibold">Back</div>
      </div>

      <div className="mt-4 space-y-2 px-3 py-2">
        <div className="text-sm font-medium uppercase text-slate-500">
          App Settings
        </div>
        <Link
          className={cn(commonStyle, select === 1 ? 'bg-slate-100' : '')}
          href={`/app/${appId}/settings/basics`}
          onClick={() => {
            setSelected(1)
          }}
        >
          <div className="text-sm font-medium">Basics</div>
          <div className="text-sm text-slate-500">
            Some basic configurations of the App.
          </div>
        </Link>
        <Link
          className={cn(commonStyle, select === 2 ? 'bg-slate-100' : '')}
          onClick={() => setSelected(2)}
          replace
          href={`/app/${appId}/settings/workflow`}
        >
          <div className="text-sm font-medium">Workflow</div>
          <div className="text-sm text-slate-500">
            Workflow related configurations of the App.
          </div>
        </Link>
        <Link
          className={cn(commonStyle, select === 3 ? 'bg-slate-100' : '')}
          href={''}
          onClick={() => setSelected(3)}
        >
          <div className="text-sm font-medium">Context</div>
          <div className="text-sm text-slate-500">
            Import your own data for LLM context enhancement.
          </div>
        </Link>
      </div>
    </div>
  )
}
