import AuthButton from '@/components/auth-button'

import CategoriesList from './categories-list'

export default function CategoriesSidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-100">
      <h1 className="px-4 py-1 text-lg font-semibold leading-[48px]">
        Context AI
      </h1>
      <div className="h-px w-full bg-slate-100" />
      <CategoriesList />
      <AuthButton />
    </aside>
  )
}
