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

export async function removeSession(appId: string, sessionId: string) {
  const { userId } = auth()
  if (!userId) return null

  const foundSession = await db
    .select()
    .from(SessionsTable)
    .where(eq(SessionsTable.short_id, sessionId))
  if (!foundSession?.[0]) return null
  if (foundSession[0].app_id !== appId) return null

  const foundApp = await db
    .select()
    .from(AppsTable)
    .where(eq(AppsTable.short_id, foundSession[0].app_id))
  if (!foundApp?.[0]) return null
  if (foundApp[0].created_by !== userId) return null

  await db.delete(SessionsTable).where(eq(SessionsTable.short_id, sessionId))

  return { deletedId: sessionId }
}

export async function getLatestSessionId(appId: string) {
  const foundApp = await db
    .select()
    .from(AppsTable)
    .where(eq(AppsTable.short_id, appId))
  if (!foundApp?.[0]) return null

  const foundSession = await db
    .select()
    .from(SessionsTable)
    .orderBy(desc(SessionsTable.created_at))
    .where(eq(SessionsTable.app_id, appId))
    .limit(1)
  if (!foundSession?.[0]) return null

  return foundSession[0].short_id
}
