import Link from 'next/link'
import { currentUser, UserButton } from '@clerk/nextjs'
import { LogIn, Plus } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarNav } from '@/components/ui/sidebar-nav'

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
    <div className="flex max-h-full overflow-hidden">
      <div className="flex w-18 flex-col bg-slate-900">
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
      </div>

      <aside className="flex w-60 flex-col border-r border-gray-200">
        <h1 className="px-6 py-4 text-2xl font-semibold">Explore</h1>
        <div className="m-full h-px bg-slate-100" />
        <div className="flex-1 overflow-y-auto px-1 py-3">
          <SidebarNav items={sidebarNavItems} />
        </div>
        <div className="flex h-16 items-center bg-slate-100 px-4">
          {userId ? (
            <div className="flex items-center space-x-2">
              <UserButton />
              <div>
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs font-medium text-slate-500">{email}</p>
              </div>
            </div>
          ) : (
            <Link href="/sign-in" className="flex items-center space-x-2">
              <LogIn />
              <p className="pl-6 text-sm font-medium">Log In</p>
            </Link>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-6">
        <div className="h-96">Main area</div>
        <div className="h-96">Main area</div>
        <div className="h-96">Main area</div>
        <div className="h-96">Main area</div>
      </main>
    </div>
  )
}
