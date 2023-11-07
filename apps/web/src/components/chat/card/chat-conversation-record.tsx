'use client'

import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { PlayCircleIcon } from 'lucide-react'

import useNiceModal from '@/hooks/use-nice-modal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import ChatListWithData from '../chat-list-with-data'
import { Message } from '../types'
import { useChat } from '../useChat'

interface RecordDialogProps {
  selectedSessionId?: string
}
const ChatRecordDialog = NiceModal.create(() => {
  const { modal, onOpenChange } = useNiceModal()
  const { session } = useChat()
  // mode=debug: hidden fallback button
  return (
    <Dialog open={modal.visible} onOpenChange={onOpenChange}>
      <DialogContent className=" h-4/5 overflow-hidden lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conversation Record</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto px-6 pr-8">
          <ChatListWithData mode="debug" sessionId={session?.short_id} />
        </div>
      </DialogContent>
    </Dialog>
  )
})

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
  return (
    <Button
      variant="ghost"
      type="button"
      className="flex h-auto w-full flex-col justify-start p-0 hover:bg-white"
      onClick={() => modal.show()}
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
