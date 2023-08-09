import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { db } from '@/lib/drizzle-edge'
import { initPusher } from '@/lib/pusher-server'
import { SessionsTable } from '@/db/sessions/schema'

export async function POST(req: NextRequest) {
  try {
    const event = await req.json()

    switch (event.type) {
      case 'call.created':
        await createCall(event.type, event.data)
    }

    return NextResponse.json({ success: true, data: event.type })
  } catch (error: any) {
    console.log('webhook chat error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function createCall(type: string, data: any) {
  const { channelId, message } = data

  const pusher = initPusher()
  pusher?.trigger(channelId, 'user-chat', {
    type: 'event',
    data: {
      id: nanoid(),
      type,
      link: message,
      createdAt: Date.now(),
    },
  })

  // const { session_id: api_session_id, link } = data
  // const [session] = await db
  //   .select()
  //   .from(SessionsTable)
  //   .where(eq(SessionsTable.api_session_id, api_session_id))
  //   .limit(1)
  // if (!session) return

  // const channelId = `session-${session.short_id}`
  // const pusher = initPusher()
  // pusher?.trigger(channelId, 'user-chat', {
  //   type: 'event',
  //   data: {
  //     id: nanoid(),
  //     type,
  //     link,
  //     createdAt: new Date(),
  //   },
  // })
}
