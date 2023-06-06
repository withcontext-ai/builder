import { currentUser, UserButton } from '@clerk/nextjs'

import LoginLink from '@/components/login-link'
import SidebarLayout from '@/components/sidebar-layout'

export default async function BotPage({
  params,
}: {
  params: { bot_id: string }
}) {
  const { bot_id } = params
  const {
    id: userId,
    emailAddresses,
    firstName,
    lastName,
  } = (await currentUser()) ?? {}
  const name = `${firstName} ${lastName}`
  const email = emailAddresses?.[0].emailAddress

  return (
    <SidebarLayout
      sidebar={
        <>
          <h1 className="px-6 py-4 text-2xl font-semibold">Bot: {bot_id}</h1>
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
      }
    >
      Chat: {bot_id}
    </SidebarLayout>
  )
}
