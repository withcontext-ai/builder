import ChatCard, { IMessage } from './chat-card'

const messages = [
  {
    role: 'ai',
    name: 'AI IInterview',
    time: '9:26AM',
    text: 'hello what can i do for you',
    img: 'https://github.com/withcontext-ai.png',
  },
  {
    role: 'user',
    name: 'ME',
    time: '9:50AM',
    text: 'could you please tell me how to prepare for an interview',
  },
  {
    role: 'ai',
    name: 'ME',
    time: '10:50AM',
    text: 'The Context Company Employee Handbook outlines rules and regulations for employees, emphasizing the importance of integrating into the company and maintaining a positive attitude. The company values integrity, respect, and transparency, and provides a fair and equitable work environment. The recruitment process involves applying to HR, submitting documents, and undergoing training, with a six-month trial period and closely monitored attendance.',
  },
]

const ChatList = () => {
  const model_avatar = 'https://github.com/withcontext-ai.png'
  const user_avatar = 'https://github.com/withcontext-ai.png'
  return (
    <div className="flex flex-1 flex-col gap-12 overflow-auto p-6">
      {messages?.map((message: any) => {
        return (
          <ChatCard
            message={message}
            key={message?.text}
            model_avatar={model_avatar}
            user_avatar={user_avatar}
          />
        )
      })}
    </div>
  )
}

export default ChatList
