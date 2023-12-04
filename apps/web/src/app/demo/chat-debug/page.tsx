import ChatDebug from '@/components/chat-debug'

const ChatDebugPage = () => {
  const values = {
    session: {
      short_id: '',
      name: '1',
      api_session_id: '1',
    },
    app: {
      name: '222',
      icon: 'https://backend.withcontext.ai/backend/upload/2023/04/65947928-68d6-4f64-99d9-0b98578fe4c6.jpeg',
      short_id: '11',
      opening_remarks: '',
      enable_video_interaction: false,
      published_workflow_data_str: JSON.stringify([
        { formValueStr: JSON.stringify({ enable_video_interaction: false }) },
      ]),
    },
  }
  return (
    <div className="p-6">
      <ChatDebug {...values} mode="debug" />
    </div>
  )
}

export default ChatDebugPage
