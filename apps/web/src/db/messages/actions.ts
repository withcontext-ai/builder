import 'server-only'

import { redirect } from 'next/navigation'
import { and, asc, desc, eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle-edge'

import { Message, MessagesTable } from './schema'

export async function getMessages(sessionId: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const sq = db
      .select()
      .from(MessagesTable)
      .where(
        and(
          eq(MessagesTable.session_id, sessionId),
          eq(MessagesTable.archived, false)
        )
      )
      .orderBy(desc(MessagesTable.created_at))
      .limit(100) // FIXME: pagination
      .as('sq')
    return db.select().from(sq).orderBy(asc(sq.created_at))
  } catch (error) {
    redirect('/')
  }
}

export async function addMessage(message: Message) {
  try {
    const [newMessage] = await db
      .insert(MessagesTable)
      .values(message)
      .returning()
    return newMessage
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function removeMessage(id: string) {
  try {
    const [found] = await db
      .select()
      .from(MessagesTable)
      .where(eq(MessagesTable.short_id, id))
    if (!found) {
      throw new Error('Message not found')
    }

    await db
      .update(MessagesTable)
      .set({ archived: true, updated_at: new Date() })
      .where(eq(MessagesTable.short_id, id))
  } catch (error: any) {
    throw new Error(error.message)
  }
}
