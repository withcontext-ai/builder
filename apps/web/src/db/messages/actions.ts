import 'server-only'

import { redirect } from 'next/navigation'
import { and, desc, eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle-edge'

import { MessagesTable } from './schema'

export async function getMessages(sessionId: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Not authenticated')
    }

    return db
      .select()
      .from(MessagesTable)
      .orderBy(desc(MessagesTable.created_at))
      .where(
        and(
          eq(MessagesTable.session_id, sessionId),
          eq(MessagesTable.archived, false)
        )
      )
      .limit(100) // FIXME: pagination
  } catch (error) {
    redirect('/')
  }
}
