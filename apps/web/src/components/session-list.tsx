'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Session } from '@/db/sessions/schema'
import { Loader2Icon, PlusIcon } from 'lucide-react'

import SessionListItem from './session-list-item'

interface IProps {
  value: Session[]
  appId: string
}

export default function SessionList({ value, appId }: IProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  async function handleAdd() {
    try {
      setIsLoading(true)
      const result = await fetch(`/api/apps/${appId}/sessions`, {
        method: 'POST',
      })
      const json = await result.json()
      console.log('handleAdd json:', json)
      router.push(`/app/${appId}/session/${json.data.sessionId}`)
      router.refresh()
    } catch (error) {
      console.log('handleAdd error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="-mx-2 flex h-9 items-center justify-between p-2">
        <div className="text-sm text-slate-900">New Chat</div>
        <button
          className="rounded-full p-1 hover:bg-slate-100"
          aria-hidden="true"
          onClick={handleAdd}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <PlusIcon className="h-4 w-4 shrink-0" />
          )}
        </button>
      </div>
      <nav className="mt-1 flex flex-1 flex-col" aria-label="SessionList">
        <ul role="list" className="-mx-2 space-y-1">
          {value.map(({ short_id, name }) => (
            <SessionListItem key={short_id} id={short_id} name={name} />
          ))}
        </ul>
      </nav>
    </div>
  )
}
