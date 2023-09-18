'use client'

import * as React from 'react'
import { Loader2, RefreshCw, StopCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useEnterSubmit } from '@/hooks/use-enter-submit'
import useSubmitHandler from '@/hooks/use-submit-handler'

import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { useChatContext } from './chat-context'
import { useChat } from './useChat'

interface InputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  reload: () => void
  stop: () => void
  showResend?: boolean
  disabled?: boolean
}

const ChatInput = ({
  onSubmit,
  reload,
  stop,
  showResend,
  disabled,
}: InputProps) => {
  const { handleInputChange, isLoading, input } = useChat()
  const { mode } = useChatContext()
  const isDebug = mode === 'debug'

  const { formRef, onKeyDown } = useEnterSubmit()
  const { shouldSubmit } = useSubmitHandler()

  return (
    <div
      className={cn(
        'relative flex w-full flex-col gap-4',
        isDebug ? '' : 'px-6 pb-4'
      )}
    >
      <div className="absolute top-[-60px] flex w-full items-center justify-center">
        {showResend && !isLoading && (
          <Button className="bg-white" onClick={reload} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Regenerate response
          </Button>
        )}
        {isLoading && (
          <Button
            className="bg-white"
            onClick={stop}
            variant="outline"
            data-testid="stop"
          >
            <StopCircle size={16} className="mr-2" />
            Stop generating
          </Button>
        )}
      </div>
      <form onSubmit={onSubmit} ref={formRef}>
        <div className="flex justify-between space-x-2">
          <Textarea
            className="min-h-[40px]"
            placeholder="Type a message"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (!disabled && shouldSubmit(e)) {
                onKeyDown(e)
              }
            }}
            minRows={1}
            maxRows={8}
            data-testid="input"
          />
          <Button type="submit" disabled={disabled} data-testid="send">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatInput
