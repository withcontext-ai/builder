'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Loader2Icon, MessageCircleIcon, TrashIcon } from 'lucide-react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'

import ConfirmDialog from './confirm-dialog'
import { SectionTooltip } from './hover-tooltip'

function removeSession(url: string) {
  return fetcher(url, { method: 'DELETE' })
}

interface ISessionItem {
  id: string
  name: string
  isOnlyOneSession: boolean
}

export default function SessionListItem({
  id,
  name,
  isOnlyOneSession,
}: ISessionItem) {
  const router = useRouter()
  const params = useParams()
  const appId = params.app_id
  const sessionId = params.session_id
  const href = `/app/${appId}/session/${id}`
  const isSelected = sessionId == id

  const [open, setOpen] = React.useState(false)

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
      mutate('/api/me/workspace')
      router.push(`/app/${appId}/session/${json?.latestId}`)
    } catch (error) {
      console.log('SessionListItem handleRemove error:', error)
    }
  }

  return (
    <>
      <li>
        <Link
          href={href}
          className={clsx(
            isSelected ? 'bg-slate-200' : 'hover:bg-slate-200',
            'relative group flex items-center gap-x-2 p-2 rounded-md text-sm font-medium text-slate-900'
          )}
        >
          <MessageCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{name}</span>
          <SectionTooltip content="Delete Chat">
            {!isOnlyOneSession && isSelected && (
              <button
                className="absolute right-2 rounded-full bg-slate-200 p-1 text-center hover:bg-white"
                aria-hidden="true"
                onClick={() => setOpen(true)}
                disabled={isMutating}
              >
                {isMutating ? (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                ) : (
                  <TrashIcon className="h-4 w-4 shrink-0" />
                )}
              </button>
            )}
          </SectionTooltip>
        </Link>
      </li>
      {!isOnlyOneSession && isSelected && (
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Delete chat?"
          description="Are you sure you want to delete this chat? You won’t be able to see chat history if deleted."
          confirmText="Delete Chat"
          loadingText="Deleting..."
          handleConfirm={handleRemove}
          isLoading={isMutating}
        />
      )}
    </>
  )
}
