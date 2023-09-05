import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/drizzle-edge'
import { nanoid } from '@/lib/utils'
import { addMessage } from '@/db/messages/actions'
import { Message } from '@/db/messages/schema'
import { SessionsTable } from '@/db/sessions/schema'
import { EventMessage } from '@/components/chat/types'

async function getSession(session_id: string) {
  const [session] = await db
    .select()
    .from(SessionsTable)
    .where(eq(SessionsTable.short_id, session_id))
    .limit(1)

  return session
}

export async function POST(req: NextRequest) {
  try {
    const { session_id, event } = (await req.json()) as {
      session_id: string
      event: EventMessage
    }
    const session = await getSession(session_id)
    if (!session) throw new Error('Session not found')
    const message = {
      short_id: nanoid(),
      session_id,
      type: 'event',
      role: 'assistant',
      event_type: event.eventType,
    } as Message
    await addMessage(message)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
