import { NextRequest } from 'next/server'
import { Message } from 'ai'

import { auth, currentUserEmail } from '@/lib/auth'
import { flags } from '@/lib/flags'
import { logsnag } from '@/lib/logsnag'
import { OpenAIStream } from '@/lib/openai-stream'
import { nanoid } from '@/lib/utils'
import { updateMessagesToSession } from '@/db/sessions/actions'

export const runtime = 'edge'

const baseUrl = `${process.env.AI_SERVICE_API_BASE_URL}/v1`

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const email = await currentUserEmail()
  const body = await req.json()
  const appId = body.appId as string
  const sessionId = body.sessionId as string
  const apiSessionId = body.apiSessionId as string
  const messages = body.messages as Message[]

  const requestId = nanoid()
  await logsnag?.publish({
    channel: 'chat',
    event: 'Chat Request',
    icon: '➡️',
    description: `${email} send a request with ${messages.length} messages`,
    tags: {
      'request-id': requestId,
      'user-id': userId,
      'app-id': appId || 'unknown',
      'session-id': sessionId,
      'message-count': messages.length,
      'is-prod': flags.isProd,
    },
  })

  const messageId = nanoid()

  const requestTimestamp = Date.now()

  const payload = {
    session_id: apiSessionId,
    messages: messages.map((message) => ({
      role: message.role,
      content: `${message.content}\n\nRequest timestamp: ${requestTimestamp}`,
    })),
  }

  const stream = await OpenAIStream({
    baseUrl,
    payload,
    callback: {
      async onStart() {
        const responseTimestamp = Date.now()
        const latencyMs = responseTimestamp - requestTimestamp
        console.log('requestTimestamp:', requestTimestamp)
        console.log('responseTimestamp:', responseTimestamp)
        console.log('latencyMs:', latencyMs)
        await logsnag?.publish({
          channel: 'chat',
          event: 'Chat Response',
          icon: '⬅️',
          description: `${email} get a response within ${latencyMs}ms`,
          tags: {
            'request-id': requestId,
            'user-id': userId,
            'app-id': appId || 'unknown',
            'session-id': sessionId,
            'latency-ms': latencyMs,
            'is-prod': flags.isProd,
          },
        })
      },
      async onCompletion(completion, token) {
        const responseTimestamp = Date.now()
        const latency = responseTimestamp - requestTimestamp
        const payload = [
          ...messages,
          ...(completion
            ? [
                {
                  role: 'assistant',
                  content: completion,
                  createdAt: new Date(),
                  id: messageId,
                  meta: {
                    latency,
                    // todo impl actual
                    // token: 50,
                    // raw: {
                    //   request: messages,
                    //   response: completion,
                    // },
                  },
                },
              ]
            : []),
        ] as Message[]
        await updateMessagesToSession(sessionId, payload)
      },
    },
    data: {
      id: messageId,
    },
  })

  return new Response(stream)
}
