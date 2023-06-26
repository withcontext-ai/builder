'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Loader2Icon, MessageCircleIcon, TrashIcon } from 'lucide-react'

interface ISessionItem {
  id: string
  name: string
}

export default function SessionListItem({ id, name }: ISessionItem) {
  const router = useRouter()
  const params = useParams()
  const appId = params.app_id
  const sessionId = params.session_id
  const href = `/app/${appId}/session/${id}`
  const isSelected = sessionId == id

  const [isLoading, setIsLoading] = React.useState(false)

  async function handleRemove() {
    try {
      setIsLoading(true)
      const result = await fetch(`/api/apps/${appId}/sessions/${sessionId}`, {
        method: 'DELETE',
      })
      const json = await result.json()
      console.log('handleRemove json:', json)
      router.push(`/app/${appId}`)
      router.refresh()
    } catch (error) {
      console.log('handleRemove error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          isSelected ? 'bg-slate-100' : 'hover:bg-slate-100',
          'relative group flex items-center gap-x-2 p-2 rounded-md text-sm font-medium text-slate-900'
        )}
      >
        <MessageCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{name}</span>
        {isSelected && (
          <button
            className="absolute right-2 rounded-full bg-slate-100 p-1 text-center hover:bg-white"
            aria-hidden="true"
            onClick={handleRemove}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4 shrink-0" />
            )}
          </button>
        )}
      </Link>
    </li>
  )
}
