'use client'

import { Ref, useState } from 'react'
import { useChatStore } from '@/store/chat'

import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface InputProps {
  onSend?: (data: Record<string, string>) => void
  conversationId?: string
  loading?: boolean
  inputRef?: Ref<HTMLInputElement>
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

  const handleKeyUp = async (event: React.KeyboardEvent<HTMLInputElement>) => {
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
  return (
    <div className="flex justify-between gap-2 px-6 py-4">
      <Input
        ref={inputRef}
        type="textarea"
        placeholder="Type a message"
        onKeyUp={handleKeyUp}
        value={message}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          if (checkMsg(event?.target?.value)) {
            setMessage(event?.target?.value)
          }
        }}
      />
      <Button disabled={!message || loading} onClick={() => handleClick()}>
        send
      </Button>
    </div>
  )
}

export default ChatInput
