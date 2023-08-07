import { NextRequest, NextResponse } from 'next/server'

import { initPusher } from '@/lib/pusher-server'

export async function POST(req: NextRequest) {
  try {
    const event = await req.json()

    switch (event.type) {
      case 'chat.created':
        await createChat(event.data)
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

async function createChat(data: any) {
  const { message } = data
  const pusher = initPusher()
  pusher?.trigger('my-channel', 'my-event', {
    message,
  })
}
