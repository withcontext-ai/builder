'use client'

import { ChatMessage, useChatStore } from '@/store/chat'
import { Dot, Loader2, MoreHorizontal, RefreshCw } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { Button } from '../ui/button'
import { Toggle } from '../ui/toggle'
import Typography from '../ui/typography'
import { MarkDown } from './markdown/markdown'

interface IProps {
  message?: ChatMessage
  model_avatar?: string
  user_avatar?: string
  isEnd?: boolean
}

const ChatCard = (props: IProps) => {
  const { message, model_avatar, user_avatar, isEnd } = props
  const isUser = message?.role === 'user'
  const chatStore = useChatStore()
  const { messages, sendMessage } = chatStore
  const handleClick = () => {
    const question = messages?.slice(-2, -1)
    console.log(question, '-----question')
    sendMessage(question?.[0]?.content || '')
  }
  return (
    <div
      className={`flex flex-col ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <Avatar>
            <AvatarImage src={model_avatar} alt="@shadcn" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col `}>
          <div
            className={`mb-5 flex items-center gap-1 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <Typography variant="body2">{message?.name}</Typography>
            <div className="text-xs	font-medium	text-gray-500">
              {message?.date}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div
              className={`rounded-lg p-4	text-sm ${
                isUser ? 'bg-primary text-white' : 'bg-gray-100'
              } sm:max-w-full md:max-w-full lg:max-w-screen-sm	xl:max-w-screen-sm`}
            >
              <MarkDown>{message?.content || ''}</MarkDown>
              {message?.streaming && (
                <div className="flex">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                </div>
              )}
            </div>
            {isEnd && (
              <Toggle className="h-6 w-6 p-1" onClick={handleClick}>
                <RefreshCw size={20} />
              </Toggle>
            )}
          </div>
        </div>
        {isUser && (
          <Avatar>
            <AvatarImage src={user_avatar || ''} alt="@shadcn" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}

export default ChatCard
