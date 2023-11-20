'use client'

import { useEffect, useMemo, useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { Loader2Icon, PlayCircleIcon, XIcon } from 'lucide-react'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'
import useNiceModal from '@/hooks/use-nice-modal'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

import { ChatContextProvider } from '../chat-context'
import ChatList from '../chat-list'
import { ChatApp, ChatSession, ChatUser, Message } from '../types'
import { useChat } from '../useChat'

interface IRecordModal {
  messages: Message[]
  app?: ChatApp | null
  session: ChatSession
  user?: ChatUser | null
}

const ChatRecordDialog = NiceModal.create(
  ({ messages, app, session, user }: IRecordModal) => {
    const { modal } = useNiceModal()

    return (
      <AlertDialog open={modal.visible}>
        <AlertDialogContent className=" h-4/5 overflow-hidden lg:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-between">
              Conversation Record
              <Button className="h-8 w-8 p-0" variant="outline">
                <XIcon size="16" onClick={() => modal.remove()} />
              </Button>
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="overflow-auto px-6 pr-8">
            <ChatContextProvider
              mode="debug"
              app={app}
              user={user}
              session={session!}
            >
              <ChatList messages={messages} />
            </ChatContextProvider>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
)

interface IProps {
  recordId?: string
}

const Loading = (
  <div className="w-full min-w-[500px] space-y-1">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-4 w-2/3" />
  </div>
)

function getRecords(url: string) {
  return fetcher(url)
}

interface ConversationRecordData {
  messages: Message[]
  video_url: string
  status?: 0 | 1 //1:done
}

const ChatConversationRecord = (props: IProps) => {
  const { recordId } = props
  const modal = useModal(ChatRecordDialog)
  const { session, app, user } = useChat()
  const [data, setData] = useState<ConversationRecordData>()
  const { toast } = useToast()
  const { trigger, isMutating } = useSWRMutation(
    `/api/chat/event/message_id=${recordId}`,
    getRecords
  )

  useEffect(() => {
    trigger()
  }, [recordId])

  const openModal = async () => {
    modal.show({ messages: data?.messages, session, app, user })
  }

  const replay = async () => {
    const { data } = await trigger()
    setData(data)
    if (data?.status === 0) {
      toast({
        description: 'Video playback is being generated, please wait.',
      })
      return
    } else {
      window.open(data?.video_url)
    }
  }
  const latest = useMemo(() => data?.messages?.slice(0, 4), [data?.messages])
  return (
    <Button
      variant="ghost"
      type="button"
      className="flex h-auto w-full flex-col justify-start p-0 hover:bg-white"
      onClick={openModal}
    >
      <div className="flex w-full border-b pb-3 text-sm font-medium">
        Conversation Record
      </div>
      <div className="flex w-full flex-col truncate pt-3">
        {isMutating
          ? Loading
          : latest?.map((item, index) => {
              const label = item?.role === 'user' ? 'Me:' : 'AI Interview:'
              return (
                <div
                  key={index}
                  className="truncate text-left text-xs text-slate-500"
                >
                  {label} {item?.content}
                </div>
              )
            })}
      </div>
      {!isMutating && (
        <div className="mt-3 flex w-full justify-start border-t pt-3">
          <Button
            className="gap-2"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              replay()
            }}
            disabled={isMutating}
          >
            {isMutating ? <Loader2Icon /> : <PlayCircleIcon />}
            Video Replay
          </Button>
        </div>
      )}
    </Button>
  )
}

export default ChatConversationRecord
