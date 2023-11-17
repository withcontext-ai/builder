'use client'

import { useState } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { PlayCircleIcon, XIcon } from 'lucide-react'

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

const messages = [
  {
    role: 'assistant',
    content:
      ' Hello, welcome to the voice interview, please let me know when you are ready.',
  },
  {
    role: 'user',
    content: ' I am ready.',
  },
  {
    role: 'assistant',
    content: 'AI Interview: Ok, let’s start. Please introduce yourself.',
  },
  {
    role: 'user',
    content:
      ' Hi, my name is (what?)My name is (who?)My name is (chka-chka, Slim Shady)Hi, my name is (huh?) ffjf qjeejwrtttyyy lalalala ccccc',
  },
] as Message[]

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

const ChatConversationRecord = (props: IProps) => {
  const { recordId } = props
  const modal = useModal(ChatRecordDialog)
  const { session, app, user } = useChat()
  const [data, setData] = useState()
  // const { trigger, isMutating } = useSWRMutation(
  //   `record_id=${recordId}`,
  //   getRecords
  // )
  // useEffect(() => {
  //   trigger()
  // }, [recordId])
  let isMutating = false

  function replay() {
    //toast: Video playback is being generated, please wait.
  }
  return (
    <Button
      variant="ghost"
      type="button"
      className="flex h-auto w-full flex-col justify-start p-0 hover:bg-white"
      onClick={() => modal.show({ messages, session, app, user })}
    >
      <div className="flex w-full border-b pb-3 text-sm font-medium">
        Conversation Record
      </div>
      <div className="flex w-full flex-col truncate pt-3">
        {isMutating
          ? Loading
          : messages?.map((item, index) => {
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
              window.open('https://build.withcontext.ai/apps')
            }}
          >
            <PlayCircleIcon />
            Video Replay
          </Button>
        </div>
      )}
    </Button>
  )
}

export default ChatConversationRecord
