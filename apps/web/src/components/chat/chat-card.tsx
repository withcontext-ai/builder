import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface IProps {
  message?: IMessage
}
interface IMessage {
  role?: 'user' | 'ai'
}

const ChatCard = (props: IProps) => {
  const { message } = props
  const isUser = message?.role === 'user'
  return (
    <div className="flex flex-1 overflow-auto p-6">
      <div className="flex flex-col">
        {!isUser && (
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}

export default ChatCard
