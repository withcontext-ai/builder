import { MenuIcon } from 'lucide-react'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface IProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  pageTitle?: string
  mainClassnames?: string
}

export default function RootLayout({
  sidebar,
  children,
  pageTitle,
  mainClassnames,
}: IProps) {
  return (
    <>
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col">
        {sidebar}
      </div>

      {/* Float sidebar for mobile */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white p-4 shadow-sm sm:px-6 lg:hidden">
        <Sheet>
          <SheetTrigger className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-auto p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
        {pageTitle && (
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            {pageTitle}
          </div>
        )}
      </div>

      {/* Page content for desktop and mobile */}
      <main className={mainClassnames}>{children}</main>
    </>
  )
}
