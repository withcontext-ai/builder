'use client'

import { useState } from 'react'

import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface InputProps {
  onSend?: (data: Record<string, string>) => void
  conversationId: string
  loading?: boolean
}

const ChatInput = (props: InputProps) => {
  const { loading = false, onSend, conversationId } = props
  const [message, setMessage] = useState('')

  const checkMsg = (msg: string) => {
    const value = new Set(msg.split('')) //判断空格和多个回车
    console.log(value.size, '--value', message)
    if (value.size === 1 && (value.has('\n') || value.has(''))) return false
    return true
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !loading && message && onSend) {
      onSend?.({ conversationId, message })
    }
    // setMessage('')
  }

  const handleClick = () => {
    if (message && onSend) {
      onSend({ conversationId, message })
    }
    // setMessage('')
  }
  console.log(!message, '----loading', message)
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
      <Button disabled={!message || loading} onClick={handleClick}>
        send
      </Button>
    </div>
  )
}

export default ChatInput
