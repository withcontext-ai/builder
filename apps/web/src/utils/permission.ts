import 'server-only'

import { auth, currentUser } from '@/lib/auth'

export async function checkOwnership(ownerId: string) {
  const { userId } = auth()
  const { isAdmin } = await currentUser()
  const isOwner = userId === ownerId
  return isOwner || isAdmin
}
