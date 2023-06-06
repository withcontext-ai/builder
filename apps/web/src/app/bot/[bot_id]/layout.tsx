import Link from 'next/link'
import { auth } from '@clerk/nextjs'
import { Plus } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import AppLayout from '@/components/app-layout'

export default function BotLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()

  return (
    <AppLayout
      sidebar={
        userId ? (
          <>
            <div className="mt-6 flex shrink-0 items-center justify-center">
              <Link href="/">
                <Avatar className="h-12 w-12 bg-white">
                  <AvatarImage src="https://github.com/withcontext-ai.png" />
                  <AvatarFallback>CO</AvatarFallback>
                </Avatar>
              </Link>
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
                  <Link href="/bot/lzl">
                    <Avatar className="h-12 w-12 bg-white">
                      <AvatarImage src="https://github.com/lzl.png" />
                      <AvatarFallback>LZL</AvatarFallback>
                    </Avatar>
                  </Link>
                </li>
                <li>
                  <Link href="/bot/shadcn">
                    <Avatar className="h-12 w-12 bg-white">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Link>
                </li>
                {[...Array(10)].map((_, i) => (
                  <li key={i}>
                    <Link href={`/bot/b${i}`}>
                      <Avatar className="h-12 w-12 bg-white">
                        <AvatarFallback>B{i}</AvatarFallback>
                      </Avatar>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        ) : null
      }
    >
      {children}
    </AppLayout>
  )
}
