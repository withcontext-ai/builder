import { NextRequest } from 'next/server'

import { auth, currentUserEmail } from '@/lib/auth'
import { logsnag } from '@/lib/logsnag'
import { OpenAIStream } from '@/lib/openai-stream'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const email = await currentUserEmail()
  const body = await req.json()
  const appId = body.appId as string
  const apiSessionId = body.apiSessionId as string
  const query = body.query as string
  const reloadMessageId = body.reloadId as string
  const messageId = reloadMessageId || nanoid()

  const payload = {
    session_id: apiSessionId,
    messages: [
      {
        role: 'user',
        content: query,
      },
    ],
    message_id: messageId,
  }

  const requestId = nanoid()
  await logsnag?.track({
    user_id: userId,
    channel: 'chat',
    event: 'Chat Request (debug)',
    icon: '➡️',
    description: `${email} send a chat request`,
    tags: {
      'request-id': requestId,
      'user-id': userId,
      'app-id': appId || 'unknown',
    },
  })

  const requestTimestamp = Date.now()

  const stream = await OpenAIStream({
    payload,
    callback: {
      async onStart() {
        const responseTimestamp = Date.now()
        const latencyMs = responseTimestamp - requestTimestamp
        await logsnag?.track({
          user_id: userId,
          channel: 'chat',
          event: 'Chat Response (debug)',
          icon: '⬅️',
          description: `${email} get a response within ${latencyMs}ms`,
          tags: {
            'request-id': requestId,
            'user-id': userId,
            'app-id': appId || 'unknown',
            'latency-ms': latencyMs,
          },
        })
      },
    },
    data: {
      id: messageId,
    },
  })

  return new Response(stream)
}
