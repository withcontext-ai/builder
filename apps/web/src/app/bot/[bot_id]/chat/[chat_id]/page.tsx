import Chat from '@/components/chat/page'

interface IProps {
  params: { chat_id: string }
}

export default function ChatPage({ params }: IProps) {
  const { chat_id } = params
  // TODO: put <Chat id={chat_id} /> component into this page
  // and use chat_id to fetch chat data
  return (
    <div className="h-full w-full overflow-hidden">
      <Chat chat_id={chat_id} />
    </div>
  )
}
