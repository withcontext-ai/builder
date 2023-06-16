import { cn } from '@/lib/utils'

interface IProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  mainClassName?: string
}

export default function SidebarLayout({
  sidebar,
  children,
  mainClassName,
}: IProps) {
  return (
    <div className="flex flex-1">
      <aside className="flex w-60 flex-col border-r border-slate-100">
        {sidebar}
      </aside>
      <main className={cn('flex-1 overflow-y-auto px-8 py-6 ', mainClassName)}>
        {children}
      </main>
    </div>
  )
}
