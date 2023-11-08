'use client'

import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { PlayCircleIcon, XIcon } from 'lucide-react'

import useNiceModal from '@/hooks/use-nice-modal'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import ChatListWithData from '../chat-list-with-data'
import { Message } from '../types'
import { useChat } from '../useChat'

const ChatRecordDialog = NiceModal.create(
  ({ sessionId }: { sessionId: string }) => {
    const { modal } = useNiceModal()

    // mode=debug: hidden fallback button
    return (
      <AlertDialog open={modal.visible}>
        <AlertDialogContent className=" h-4/5 overflow-hidden lg:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-between">
              Conversation Record
              <Button className="h-8 w-8 p-0" variant="outline">
                <XIcon size="16" onClick={() => modal.hide()} />
              </Button>
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="overflow-auto px-6 pr-8">
            <ChatListWithData mode="debug" sessionId={sessionId} />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
)

interface IProps {
  messages?: Message[]
  link?: string
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
]

const ChatConversationRecord = (props: IProps) => {
  const modal = useModal(ChatRecordDialog)
  const { session } = useChat()
  return (
    <Button
      variant="ghost"
      type="button"
      className="flex h-auto w-full flex-col justify-start p-0 hover:bg-white"
      onClick={() => modal.show({ sessionId: session?.short_id })}
    >
      <div className="flex w-full border-b pb-3 text-sm font-medium">
        Conversation Record
      </div>
      <div className="flex w-full flex-col truncate border-b py-3">
        {messages?.map((item, index) => {
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
      <div className="mt-3 flex w-full justify-start">
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
    </Button>
  )
}

export default ChatConversationRecord
