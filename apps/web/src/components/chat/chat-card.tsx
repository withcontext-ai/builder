'use client'

import { ChatMessage } from '@/store/chat'
import { Loader2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
  const { message, model_avatar, user_avatar } = props
  const isUser = message?.role === 'user'
  const showCustomerCard = false

  return (
    <div className="flex flex-col ">
      <div className="flex gap-2 ">
        <Avatar>
          <AvatarImage
            src={!isUser ? model_avatar : user_avatar}
            alt="@shadcn"
          />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>

        <div className={`flex flex-col `}>
          <div className="mb-5 flex items-center gap-1 ">
            <Typography variant="body2">
              {isUser ? 'Me' : 'AI Assistant'}
            </Typography>
            <div className="text-xs	font-medium	text-gray-500">
              {message?.createdAt &&
                new Date(message?.createdAt).toLocaleTimeString('en-US')}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div
              className={`rounded-lg ${
                showCustomerCard ? 'p-0' : 'p-4'
              }	text-sm ${
                isUser ? 'bg-primary text-white' : 'bg-gray-100'
              } sm:max-w-full md:max-w-2xl lg:max-w-3xl	xl:max-w-3xl`}
            >
              <MarkDown>{message?.content || ''}</MarkDown>
              {/* {showCustomerCard && <CustomerCard />} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatCard
