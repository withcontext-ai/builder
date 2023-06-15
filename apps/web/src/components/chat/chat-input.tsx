'use client'

import { Ref, useState } from 'react'
import { useChatStore } from '@/store/chat'
import { Loader2 } from 'lucide-react'

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
    // 重新询问
    if (message) {
      await chatStore.sendMessage(message)
      setMessage('')
    }
  }
  return (
    <div className="flex justify-between gap-2 px-6 py-4">
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
  )
}

export default ChatInput
