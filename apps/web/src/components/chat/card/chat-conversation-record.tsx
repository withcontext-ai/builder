'use client'

import { useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { Loader2Icon, PlayCircleIcon, XIcon } from 'lucide-react'
import useSWR from 'swr'

import { cn, fetcher, nanoid } from '@/lib/utils'
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
    const { modal, onOpenChange } = useNiceModal()

    return (
      <AlertDialog open={modal.visible} key={nanoid()}>
        <AlertDialogContent className=" h-4/5 overflow-hidden lg:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-between">
              Conversation Record
              <Button
                className="h-8 w-8 p-0"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <XIcon size="16" />
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

const LoadingCard = (
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

const ChatConversationRecord = (props: IProps) => {
  const { recordId } = props
  const modal = useModal(ChatRecordDialog)
  const { session, app, user } = useChat()
  const [replaying, setReplaying] = useState(false)
  const { data, isLoading, mutate } = useSWR(
    `/api/chat/event?message_id=${recordId}`,
    getRecords
  )

  const { toast } = useToast()

  const openModal = async () => {
    modal.show({ messages: data?.messages, session, app, user })
  }

  const replay = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    if (!data?.video_url) {
      setReplaying(true)
      await mutate()
      setReplaying(false)
    }
    if (data?.status === 0) {
      toast({
        description: 'Video playback is being generated, please wait.',
      })
      return
    } else {
      window.open(data?.video_url)
    }
  }
  return (
    <div
      className={cn(
        'flex h-auto w-full cursor-pointer flex-col justify-start p-0 hover:bg-white',
        isLoading && 'pointer-events-none opacity-50'
      )}
      onClick={openModal}
    >
      <div className="flex w-full border-b pb-3 text-sm font-medium">
        Conversation Record
      </div>
      <div className="flex w-full flex-col truncate pt-3">
        {isLoading
          ? LoadingCard
          : data?.messages?.slice(0, 4)?.map((item: Message, index: number) => {
              const label = item?.role === 'user' ? 'Me:' : 'AI Interview:'
              return (
                <div
                  key={index}
                  className="truncate text-left text-xs leading-5 text-slate-500"
                >
                  {label} {item?.content}
                </div>
              )
            })}
      </div>
      {!isLoading && (
        <div className="mt-3 flex w-full justify-start border-t pt-3">
          <Button
            className="gap-2"
            type="button"
            onClick={replay}
            disabled={replaying}
          >
            {replaying ? <Loader2Icon /> : <PlayCircleIcon />}
            Video Replay
          </Button>
        </div>
      )}
    </div>
  )
}

export default ChatConversationRecord
