import AuthButton from '@/components/auth-button'
import ChatList from '@/components/chat-list'

interface IProps {
  appId: string
}

export default async function AppSidebar({ appId }: IProps) {
  return (
    <>
      <h1 className="p-4 text-2xl font-semibold">App: {appId}</h1>
      <div className="m-full h-px bg-slate-100" />
      <div className="flex-1 overflow-y-auto p-4">
        <ChatList appId={appId} />
      </div>
      <AuthButton />
    </>
  )
}
