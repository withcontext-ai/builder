'use client'

import { FormEvent, Ref } from 'react'
import { Loader2, RefreshCw, StopCircle } from 'lucide-react'

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
  reload: () => void
  stop: () => void
}

const ChatInput = (props: InputProps) => {
  const {
    inputRef,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    stop,
    showResend,
  } = props

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

      <div className="flex w-full items-center justify-center	">
        {showResend && !isLoading && (
          <Button
            className="w-[200px] gap-1"
            onClick={reload}
            variant="outline"
          >
            <RefreshCw size={20} />
            Regenerate response
          </Button>
        )}
        {isLoading && (
          <Button className="w-[200px] gap-1" onClick={stop} variant="outline">
            <StopCircle size={20} />
            Stop generating
          </Button>
        )}
      </div>
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
