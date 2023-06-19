'use client'

import { ChatMessage, useChatStore } from '@/store/chat'
import { Loader2, RefreshCw } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { Button } from '../ui/button'
import Typography from '../ui/typography'
import { MarkDown } from './markdown/markdown'
import { Message } from './type'

interface IProps {
  // message?: ChatMessage
  message?: Message
  model_avatar?: string
  user_avatar?: string
  isEnd?: boolean
}

const ChatCard = (props: IProps) => {
  const { message, model_avatar, user_avatar, isEnd } = props
  const isUser = message?.role === 'user'
  const showCustomerCard = false

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
            <Typography variant="body2">{'ai'}</Typography>
            <div className="text-xs	font-medium	text-gray-500">
              {/* {message?.date} */}
              {message?.createdAt &&
                new Date(message?.createdAt).toLocaleTimeString('en-US')}
            </div>
          </div>
          <div
            className={`flex items-end gap-2 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg ${
                showCustomerCard ? 'p-0' : 'p-4'
              }	text-sm ${
                isUser ? 'bg-primary text-white' : 'bg-gray-100'
              } sm:max-w-full md:max-w-screen-sm lg:max-w-screen-sm	xl:max-w-screen-sm`}
            >
              <MarkDown>{message?.content || ''}</MarkDown>
              {/* {showCustomerCard && <CustomerCard />} */}
              {/* {message?.streaming && (
                <div className="flex">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatCard
