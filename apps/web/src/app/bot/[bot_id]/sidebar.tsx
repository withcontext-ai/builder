import { currentUser, UserButton } from '@clerk/nextjs'

import LoginLink from '@/components/login-link'

interface IProps {
  botId: string
}

export default async function BotSidebar({ botId }: IProps) {
  const {
    id: userId,
    emailAddresses,
    firstName,
    lastName,
  } = (await currentUser()) ?? {}
  const name = `${firstName} ${lastName}`
  const email = emailAddresses?.[0].emailAddress

  return (
    <>
      <h1 className="px-6 py-4 text-2xl font-semibold">Bot: {botId}</h1>
      <div className="m-full h-px bg-slate-100" />
      <div className="flex-1 overflow-y-auto px-6 py-4">desc</div>
      <div className="flex h-16 items-center bg-slate-100">
        {userId ? (
          <div className="flex items-center space-x-2 px-4">
            <UserButton />
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs font-medium text-slate-500">{email}</p>
            </div>
          </div>
        ) : (
          <LoginLink />
        )}
      </div>
    </>
  )
}
