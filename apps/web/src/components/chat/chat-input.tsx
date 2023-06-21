'use client'

import { FormEvent, Ref } from 'react'
import { Loader2, RefreshCw, StopCircle } from 'lucide-react'

import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'

interface InputProps {
  showResend?: boolean
  isLoading: boolean
  input: string
  setInput: (e: string) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  reload: () => void
  stop: () => void
}

const ChatInput = (props: InputProps) => {
  const { input, setInput, handleSubmit, isLoading, reload, stop, showResend } =
    props
  const handleKeyUp = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && !event.altKey) {
      // @ts-ignore
      handleSubmit(event)
    }
  }

  const checkValue = (msg: string) => {
    const value = new Set(msg.split(''))
    if (value.size === 1 && (value.has('\n') || value.has(''))) return false
    return true
  }
  return (
    <div className="relative flex w-full flex-col gap-4 px-6 pb-4">
      <div className="absolute top-[-60px] flex w-full	items-center justify-center">
        {showResend && !isLoading && (
          <Button className=" bg-white" onClick={reload} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Regenerate response
          </Button>
        )}
        {isLoading && (
          <Button className=" bg-white" onClick={stop} variant="outline">
            <StopCircle size={16} className="mr-2" />
            Stop generating
          </Button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between gap-2">
          <Textarea
            placeholder="Type a message"
            onKeyUp={handleKeyUp}
            value={input}
            minRows={1}
            maxRows={8}
            onChange={(e) => {
              const value = e.target.value
              if (checkValue(value)) {
                setInput(e?.target.value)
              }
            }}
          />
          <Button type="submit" disabled={!input || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatInput
