import 'server-only'

import { desc, eq, sql } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle'
import { nanoid } from '@/lib/utils'

import { AppsTable } from '../schema/apps'
import { SessionsTable } from '../schema/sessions'

export async function addSession(appId: string) {
  const { userId } = auth()
  if (!userId) return null

  const foundApp = await db
    .select()
    .from(AppsTable)
    .where(eq(AppsTable.short_id, appId))
  if (!foundApp?.[0]) return null

  const allSessions = await db
    .select({ count: sql<number>`count(*)` })
    .from(SessionsTable)
    .where(eq(SessionsTable.app_id, appId))
  const sessionCount = Number(allSessions[0]?.count) || 0

  const sessionVal = {
    short_id: nanoid(),
    name: `Chat ${sessionCount + 1}`,
    app_id: appId,
  }
  const newSession = await db
    .insert(SessionsTable)
    .values(sessionVal)
    .returning()

  return { sessionId: newSession[0]?.short_id }
}

export async function getSessions(appId: string) {
  return db
    .select()
    .from(SessionsTable)
    .orderBy(desc(SessionsTable.created_at))
    .where(eq(SessionsTable.app_id, appId))
}
