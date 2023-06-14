'use client'

import { useState } from 'react'
import { useChatStore } from '@/store/chat'

import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface InputProps {
  onSend?: (data: Record<string, string>) => void
  conversationId?: string
  loading?: boolean
}

const ChatInput = (props: InputProps) => {
  const { loading = false, conversationId = '' } = props
  const [message, setMessage] = useState('')
  const chatStore = useChatStore()
  const checkMsg = (msg: string) => {
    const value = new Set(msg.split('')) //判断空格和多个回车
    if (value.size === 1 && (value.has('\n') || value.has(''))) return false
    return true
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !loading && message) {
      chatStore.sendMessage(message)
    }
    setMessage('')
  }

  const handleClick = () => {
    if (message) {
      chatStore.sendMessage(message)
    }
    setMessage('')
  }
  return (
    <div className="flex justify-between gap-2 px-6 py-4">
      <Input
        type="textarea"
        placeholder="Type a message"
        onKeyUp={handleKeyUp}
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
