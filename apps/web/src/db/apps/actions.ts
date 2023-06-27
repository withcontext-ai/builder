import 'server-only'

import { desc, eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle'
import { nanoid } from '@/lib/utils'

import { SessionsTable } from '../sessions/schema'
import { AppsTable, NewApp } from './schema'

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

export async function getApps() {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])

  return db
    .select()
    .from(AppsTable)
    .orderBy(desc(AppsTable.created_at))
    .where(eq(AppsTable.created_by, userId))
}

export async function removeApp(id: string) {
  return db
    .update(AppsTable)
    .set({ archived: true, updated_at: new Date() })
    .where(eq(AppsTable.short_id, id))
}
