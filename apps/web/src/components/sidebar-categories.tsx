import AuthButton from '@/components/auth-button'

import CategoriesList from './categories-list'

export default function ExploreSidebar() {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-slate-100">
      <h1 className="px-4 py-2 text-lg font-semibold">Context AI</h1>
      <div className="m-full h-px bg-slate-100" />
      <CategoriesList />
      <AuthButton />
    </aside>
  )
}
