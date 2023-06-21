'use client'

import { Message } from 'ai'
import { formatDistanceToNowStrict } from 'date-fns'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import Text from '../ui/text'
import { Markdown } from './markdown/markdown'

interface IProps {
  message?: Message
  model_avatar?: string
  user_avatar?: string
}

const ChatCard = (props: IProps) => {
  const { message, model_avatar, user_avatar } = props
  const isUser = message?.role === 'user'
  return (
    <div className="flex flex-col ">
      <div className="flex gap-2 ">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={!isUser ? model_avatar : user_avatar}
            alt="@shadcn"
          />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>

        <div className={`flex flex-col `}>
          <div className="mb-5 flex items-center gap-1">
            <Text variant="body2">{isUser ? 'Me' : 'AI Assistant'}</Text>
            <Text variant="caption">
              {message?.createdAt &&
                formatDistanceToNowStrict(message.createdAt, {
                  addSuffix: true,
                })}
            </Text>
          </div>
          <div className="flex items-end gap-2">
            <div
              className={cn(
                'rounded-lg p-4 text-sm sm:max-w-full md:max-w-full lg:max-w-3xl	xl:max-w-3xl',
                isUser ? 'bg-primary' : 'bg-gray-100'
              )}
            >
              {message?.content ? (
                <Markdown className={cn(isUser ? 'text-white' : 'text-black	')}>
                  {message?.content}
                </Markdown>
              ) : (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatCard
