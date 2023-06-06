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
    <div>
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-18 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4 lg:pt-6">
        <div className="flex shrink-0 items-center justify-center">
          <Avatar className="h-12 w-12 bg-white">
            <AvatarImage src="https://github.com/withcontext-ai.png" />
            <AvatarFallback>CO</AvatarFallback>
          </Avatar>
        </div>
        <div className="m-auto my-6 h-px w-14 bg-slate-200" />
        <nav className="mt-8">
          <ul role="list" className="flex flex-col items-center space-y-4">
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
            <li>
              <Avatar className="h-12 w-12">
                <AvatarFallback className=" bg-white">
                  <Plus />
                </AvatarFallback>
              </Avatar>
            </li>
          </ul>
        </nav>
      </div>

      <main className="lg:pl-18">
        <div className="xl:pl-60">
          <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            <div className="h-96">Main area</div>
            <div className="h-96">Main area</div>
            <div className="h-96">Main area</div>
            <div className="h-96">Main area</div>
          </div>
        </div>
      </main>

      <aside className="fixed inset-y-0 left-18 hidden w-60 flex-col overflow-y-auto border-r border-gray-200 xl:flex">
        <div className="flex-1 divide-y divide-slate-100">
          <h1 className="px-6 py-4 text-2xl font-semibold">Explore</h1>
          <div className="px-1 py-3">
            <SidebarNav items={sidebarNavItems} />
          </div>
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
            <Link href="/sign-in">
              <LogIn />
              <p className="pl-6 text-sm font-medium">Log In</p>
            </Link>
          )}
        </div>
      </aside>
    </div>
  )
}
