import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import ChatList from './chat-list'

const Chat = ({ chat_id }: { chat_id: string }) => {
  // const inputRef = useRef<HTMLTextAreaElement>(null)
  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader />
      <ChatList chat_id={chat_id} />
      <ChatInput />
    </div>
  )
}

export default Chat
