import 'server-only'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle'
import { nanoid } from '@/lib/utils'

import { AppsTable, NewApp } from '../schema/apps'
import { SessionsTable } from '../schema/sessions'

export async function addApp(app: Omit<NewApp, 'short_id' | 'created_by'>) {
  const { userId } = auth()
  if (!userId) return null

  const appVal = { ...app, short_id: nanoid(), created_by: userId }
  const newApp = await db.insert(AppsTable).values(appVal).returning()

  const sessionVal = {
    short_id: nanoid(),
    name: 'Chat 1',
    app_id: newApp[0]?.short_id,
  }
  const newSession = await db
    .insert(SessionsTable)
    .values(sessionVal)
    .returning()

  return { appId: newApp[0]?.short_id, sessionId: newSession[0]?.short_id }
}
