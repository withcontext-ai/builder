import { NextRequest, NextResponse } from 'next/server'
import { UserJSON, WebhookEvent } from '@clerk/nextjs/dist/types/server'

export async function POST(req: NextRequest) {
  const event = (await req.json()) as WebhookEvent

  switch (event.type) {
    case 'user.created':
      createUser(event.data)
  }

  return NextResponse.json({ success: true, data: event.type })
}

function createUser(data: UserJSON) {
  console.log('createUser', data, data.id)
}
