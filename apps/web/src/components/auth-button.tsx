import { currentUser } from '@/lib/auth'
import { flags } from '@/lib/flags'

import AuthDropdownMenu from './auth-dropdown-menu'

export default async function AuthButton() {
  if (!flags.enabledAuth) return null

  const { emailAddresses, firstName, lastName, imageUrl } =
    (await currentUser()) ?? {}
  const name = `${firstName} ${lastName}`
  const email = emailAddresses?.[0].emailAddress

  return (
    <AuthDropdownMenu>
      <button
        type="button"
        className="flex h-16 items-center border-t border-slate-100 text-left focus:outline-none"
      >
        <div className="flex items-center space-x-2 truncate px-4">
          <div className="h-8 w-8 overflow-hidden rounded-full">
            <img
              src={imageUrl}
              alt="current user avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs font-medium text-slate-500">
              {email}
            </p>
          </div>
        </div>
      </button>
    </AuthDropdownMenu>
  )
}
