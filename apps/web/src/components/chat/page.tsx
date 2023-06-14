import ChatHeader from './chat-header'
import ChatInput from './chat-input'
import ChatList from './chat-list'

const Chat = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <ChatHeader />
      <ChatList />
      <ChatInput />
    </div>
  )
}

export default Chat
