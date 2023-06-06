import { currentUser, UserButton } from '@clerk/nextjs'
import { Plus } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarNav } from '@/components/ui/sidebar-nav'
import AppLayout from '@/components/app-layout'
import LoginLink from '@/components/login-link'
import SidebarLayout from '@/components/sidebar-layout'

const sidebarNavItems = [
  {
    title: 'All Categories',
    href: '/',
  },
  {
    title: 'Human Resources',
    href: '/#',
  },
  {
    title: 'Translation',
    href: '/#',
  },
  {
    title: 'Knowledge Base',
    href: '/#',
  },
  {
    title: 'Self Training',
    href: '/#',
  },
]

export default async function Home() {
  const {
    id: userId,
    emailAddresses,
    firstName,
    lastName,
  } = (await currentUser()) ?? {}
  const name = `${firstName} ${lastName}`
  const email = emailAddresses?.[0].emailAddress

  return (
    <AppLayout
      sidebar={
        userId ? (
          <>
            <div className="mt-6 flex shrink-0 items-center justify-center">
              <Avatar className="h-12 w-12 bg-white">
                <AvatarImage src="https://github.com/withcontext-ai.png" />
                <AvatarFallback>CO</AvatarFallback>
              </Avatar>
            </div>
            <div className="m-auto mt-6 h-px w-14 bg-slate-200" />
            <nav className="overflow-y-auto py-6">
              <ul role="list" className="flex flex-col items-center space-y-4">
                <li>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className=" bg-white">
                      <Plus />
                    </AvatarFallback>
                  </Avatar>
                </li>
                <li>
                  <Avatar className="h-12 w-12 bg-white">
                    <AvatarImage src="https://github.com/lzl.png" />
                    <AvatarFallback>LZL</AvatarFallback>
                  </Avatar>
                </li>
                <li>
                  <Avatar className="h-12 w-12 bg-white">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </li>
                {[...Array(10)].map((_, i) => (
                  <li key={i}>
                    <Avatar className="h-12 w-12 bg-white">
                      <AvatarFallback>B{i}</AvatarFallback>
                    </Avatar>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        ) : null
      }
    >
      <SidebarLayout
        sidebar={
          <>
            <h1 className="px-6 py-4 text-2xl font-semibold">Explore</h1>
            <div className="m-full h-px bg-slate-100" />
            <div className="flex-1 overflow-y-auto px-1 py-3">
              <SidebarNav items={sidebarNavItems} />
            </div>
            <div className="flex h-16 items-center bg-slate-100">
              {userId ? (
                <div className="flex items-center space-x-2 px-4">
                  <UserButton />
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {email}
                    </p>
                  </div>
                </div>
              ) : (
                <LoginLink />
              )}
            </div>
          </>
        }
      >
        <div className="h-96">Main area</div>
        <div className="h-96">Main area</div>
        <div className="h-96">Main area</div>
        <div className="h-96">Main area</div>
      </SidebarLayout>
    </AppLayout>
  )
}
