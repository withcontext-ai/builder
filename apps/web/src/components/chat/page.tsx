import ChatCard from './chat-card'
import ChatHeader from './chat-header'
import ChatInput from './chat-input'

const ChatItem = () => {
  const data = { id: '1' }
  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader />
      <ChatCard />
      <ChatInput />
    </div>
  )
}

export default ChatItem
