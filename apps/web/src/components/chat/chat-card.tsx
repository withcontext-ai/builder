import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import Typography from '../ui/typography'
import { MarkDown } from './markdown/markdown'

interface IProps {
  message?: IMessage
  model_avatar?: string
  user_avatar?: string
}
export interface IMessage {
  role?: 'user' | 'ai'
  name?: string
  time?: string
  text?: string
  img?: string
}

const ChatCard = (props: IProps) => {
  const { message, model_avatar, user_avatar } = props
  const isUser = message?.role === 'user'
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
              {message?.time}
            </div>
          </div>

          <div
            className={`rounded-lg p-4	text-sm ${
              isUser ? 'bg-primary text-white' : 'bg-gray-100'
            } sm:max-w-full md:max-w-full lg:max-w-screen-sm	xl:max-w-screen-sm`}
          >
            <MarkDown>{message?.text || ''}</MarkDown>
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
