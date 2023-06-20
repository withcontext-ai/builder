'use client'

import { FormEvent, Ref, useState } from 'react'
import { useChatStore } from '@/store/chat'
import { Message } from 'ai'
import { findLastIndex } from 'lodash'
import { Loader2, RefreshCw } from 'lucide-react'

import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface InputProps {
  onSend?: (data: Record<string, string>) => void
  showResend?: boolean
  inputRef?: Ref<HTMLTextAreaElement>
  isLoading: boolean
  input: string
  handleInputChange: (e: any) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  handleResend: () => void
}

const ChatInput = (props: InputProps) => {
  const {
    inputRef,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    handleResend,
    showResend,
  } = props
  const chatStore = useChatStore()
  const [session] = useChatStore((state) => [state.currentSession()])

  const handleKeyUp = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && input) {
      // @ts-ignore
      handleSubmit(event)
    }
  }
  return (
    <div className="flex w-full flex-col gap-4 px-6 pb-6">
      {isLoading && (
        <div className="flex">
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        </div>
      )}

      {showResend && (
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
            value={input}
            minRows={1}
            maxRows={8}
            onChange={handleInputChange}
          />
          <Button
            type="submit"
            disabled={!input || isLoading}
            // @ts-ignore
            // onClick={(e) => {
            //   console.log(e, '---e')

            //   // @ts-ignore
            //   handleSubmit(e)
            // }}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatInput
