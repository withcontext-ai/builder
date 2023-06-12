import './globals.css'

import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import clsx from 'clsx'

import { auth } from '@/lib/auth'
import { flags } from '@/lib/flags'
import AppLayout from '@/components/app-layout'
import AppSidebar from '@/components/app-sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Context Builder',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = auth()

  if (flags.enabledAuth) {
    return (
      <ClerkProvider>
        <html lang="en" className="h-full">
          <body className={clsx('h-full', inter.className)}>
            <AppLayout sidebar={userId ? <AppSidebar /> : null}>
              {children}
            </AppLayout>
          </body>
        </html>
      </ClerkProvider>
    )
  }

  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <AppLayout sidebar={<AppSidebar />}>{children}</AppLayout>
      </body>
    </html>
  )
}
