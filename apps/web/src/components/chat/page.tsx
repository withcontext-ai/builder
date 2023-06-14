import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import ChatList from './chat-list'

const Chat = () => {
  const data = { id: '1' }
  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader />
      <ChatList />
      <ChatInput />
    </div>
  )
}

export default Chat
