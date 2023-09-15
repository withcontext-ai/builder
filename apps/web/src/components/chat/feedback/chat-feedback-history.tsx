'use client'

import { TooltipPortal, TooltipTrigger } from '@radix-ui/react-tooltip'
import { Clock, Code2, PenLine, ThumbsDown, ThumbsUp } from 'lucide-react'

import { Tooltip, TooltipContent } from '@/components/ui/tooltip'

import ChatAction, { actionCommonButtonProps } from '../chat-action'
import { ChatMessage } from '../types'

type Props = {
  message: ChatMessage
  annotating: boolean
  onAnnotate: () => void
}

const ChatFeedbackHistory = (props: Props) => {
  const { message, annotating, onAnnotate } = props
  const { id, feedback, feedback_content, meta } = message
  const { latency, token, raw } = meta || {}
  const { total_tokens } = token || {}
  if (!id) {
    return null
  }

  const Comp = feedback === 'good' ? ThumbsUp : ThumbsDown
  const color = feedback === 'good' ? 'stroke-green-500' : 'stroke-red-500'

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <ChatAction>
            <Code2 {...actionCommonButtonProps} />
          </ChatAction>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            side="bottom"
            className="max-h-fit min-h-min max-w-lg space-y-3 p-4"
          >
            <div className="font-medium">API request detail:</div>

            <div className="flex items-center space-x-2">
              {latency && (
                <>
                  <Clock size={18} />
                  <div className="font-medium">
                    {(latency / 1000).toPrecision(3)}s
                  </div>
                </>
              )}
              {latency && token && <div className="px-2 font-medium">|</div>}
              {total_tokens !== undefined && (
                <div className="text-slate-500">{total_tokens} tokens</div>
              )}
            </div>
            {raw && (
              <div className="rounded-lg bg-slate-100 p-2">
                <pre className="max-h-80 overflow-y-scroll whitespace-pre-wrap break-all">
                  {JSON.stringify(raw, null, 2)}
                </pre>
              </div>
            )}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
      {message.feedback && (
        <Tooltip>
          <TooltipTrigger>
            <ChatAction>
              <Comp {...actionCommonButtonProps} className={color} />
            </ChatAction>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent
              side="bottom"
              className="max-w-lg space-y-3 break-words p-4"
            >
              <div className="font-semibold">
                {feedback === 'good' && 'User liked this'}
                {feedback === 'bad' && 'User disliked this'}
                {feedback_content && ':'}
              </div>
              {feedback_content
                ?.split('\n')
                .map((line, index) => <div key={index}>{line}</div>)}
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger>
          <ChatAction
            // only allow clicking when not already annotating
            {...(!annotating
              ? {
                  onClick: onAnnotate,
                }
              : {})}
          >
            <PenLine {...actionCommonButtonProps} />
          </ChatAction>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            side="bottom"
            className="max-w-lg space-y-3 break-words p-4"
          >
            Annotate
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </>
  )
}

export default ChatFeedbackHistory
