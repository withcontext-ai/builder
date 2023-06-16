'use client'

import { Ref, useState } from 'react'
import { useChatStore } from '@/store/chat'
import { Loader2, XSquare } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface InputProps {
  onSend?: (data: Record<string, string>) => void
  conversationId?: string
  loading?: boolean
  inputRef?: Ref<HTMLTextAreaElement>
}

const ChatInput = (props: InputProps) => {
  const { loading = false, conversationId = '', inputRef } = props
  const [message, setMessage] = useState('')
  const chatStore = useChatStore()
  const checkMsg = (msg: string) => {
    const value = new Set(msg.split('')) //判断空格和多个回车
    if (value.size === 1 && (value.has('\n') || value.has(''))) return false
    return true
  }

  const handleKeyUp = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && !loading && message) {
      await chatStore.sendMessage(message)
      setMessage('')
    }
  }

  const handleClick = async () => {
    if (message) {
      await chatStore.sendMessage(message)
      setMessage('')
    }
  }

  const Actions = () => (
    <div className="flex ">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="h-8 w-8 rounded-full p-0">
              <XSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <Button variant="outline" onClick={() => chatStore.clearSessions()}>
              <p>clean all ChatMessage</p>
            </Button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )

  return (
    <div className="flex w-full flex-col gap-2 border-t border-slate-100 px-6 py-4	">
      <Actions />
      <div className="flex justify-between gap-2">
        <Textarea
          ref={inputRef}
          placeholder="Type a message"
          onKeyUp={handleKeyUp}
          value={message}
          minRows={1}
          maxRows={3}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (checkMsg(event?.target?.value)) {
              setMessage(event?.target?.value)
            }
          }}
        />
        <Button disabled={!message || loading} onClick={() => handleClick()}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          send
        </Button>
      </div>
    </div>
  )
}

export default ChatInput
