'use client'

import { FormEvent, Ref, useState } from 'react'
import { useChatStore } from '@/store/chat'
import { findLastIndex } from 'lodash'
import { Loader2, RefreshCw } from 'lucide-react'

import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface InputProps {
  onSend?: (data: Record<string, string>) => void
  conversationId?: string
  inputRef?: Ref<HTMLTextAreaElement>

  input: string
  handleInputChange: (e: any) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
}

const ChatInput = (props: InputProps) => {
  const {
    conversationId = '',
    inputRef,
    input,
    handleInputChange,
    handleSubmit,
  } = props
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState<boolean>(false)
  const chatStore = useChatStore()
  const [session] = useChatStore((state) => [state.currentSession()])
  const checkMsg = (msg: string) => {
    const value = new Set(msg.split('')) //判断空格和多个回车
    if (value.size === 1 && (value.has('\n') || value.has(''))) return false
    return true
  }
  const findIndex = () => {
    const messages = session?.messages
    const hasResponse = messages?.filter(
      (item) => item?.role === 'assistant' && item?.content
    )
    if (hasResponse?.length) {
      const index =
        findLastIndex(messages, (item) => item?.role === 'user') || -1
      return index
    }
    return -1
  }
  const index = findIndex()
  const handleKeyUp = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && !loading && message) {
      setLoading(true)
      await chatStore.onUserInput(message).then(() => setLoading(false))
      setMessage('')
    }
  }

  const handleClick = async () => {
    if (message) {
      setLoading(true)
      await chatStore.onUserInput(message).then(() => setLoading(false))
      setMessage('')
    }
  }
  const deleteMessage = (index: number) => {
    chatStore.updateCurrentSession((session: any) =>
      session.messages.splice(index, 2)
    )
  }

  const handleResend = () => {
    const index = findIndex() || -1
    if (index === -1) return
    const content = session.messages[index].content
    deleteMessage(index)
    chatStore.onUserInput(content).then(() => {})
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {index !== -1 && (
        <div className="flex w-full items-center justify-center	">
          <Button
            className="w-[200px] gap-1"
            onClick={handleResend}
            variant="outline"
          >
            <RefreshCw size={20} />
            Regenerate response
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between gap-2">
          <Textarea
            ref={inputRef}
            placeholder="Type a message"
            onKeyUp={handleKeyUp}
            // value={message}
            value={input}
            minRows={1}
            maxRows={3}
            // onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
            //   if (checkMsg(event?.target?.value)) {
            //     setMessage(event?.target?.value)
            //   }
            // }}
            onChange={handleInputChange}
          />
          {/* <Button disabled={!message || loading} onClick={() => handleClick()}> */}
          <Button type="submit">
            {/* {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} */}
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatInput
