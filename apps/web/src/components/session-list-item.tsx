'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Loader2Icon, MessageCircleIcon, TrashIcon } from 'lucide-react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'

function removeSession(url: string) {
  return fetcher(url, { method: 'DELETE' })
}

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

  const { mutate } = useSWRConfig()
  const { trigger, isMutating } = useSWRMutation(
    `/api/apps/${appId}/sessions/${sessionId}`,
    removeSession
  )

  async function handleRemove() {
    try {
      const json = await trigger()
      console.log('SessionListItem handleRemove json:', json)
      mutate(`/api/apps/${appId}/sessions`)
      router.push(`/app/${appId}`)
    } catch (error) {
      console.log('SessionListItem handleRemove error:', error)
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
            disabled={isMutating}
          >
            {isMutating ? (
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
