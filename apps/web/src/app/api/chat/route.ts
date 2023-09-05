import { NextRequest } from 'next/server'
import { Message } from 'ai'

import { auth, currentUserEmail } from '@/lib/auth'
import { flags } from '@/lib/flags'
import { logsnag } from '@/lib/logsnag'
import { OpenAIStream } from '@/lib/openai-stream'
import { nanoid } from '@/lib/utils'
import { addMessage, removeMessage } from '@/db/messages/actions'
import { updateMessagesToSession } from '@/db/sessions/actions'

export const runtime = 'edge'
// TODO: move to pdx1 (us-west-2) where db is located
// https://vercel.com/docs/edge-network/regions
export const preferredRegion = 'cle1' // now at us-east-2 where ai service is located
export const dynamic = 'force-dynamic'

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
  const reloadMessageId = body.reload_message_id as string

  const payload = {
    session_id: apiSessionId,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  }

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

  const stream = await OpenAIStream({
    baseUrl,
    payload,
    callback: {
      async onStart() {
        const responseTimestamp = Date.now()
        const latencyMs = responseTimestamp - requestTimestamp
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
      async onCompletion(completion, metadata) {
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
                    ...(metadata ?? {}),
                  },
                },
              ]
            : []),
        ] as Message[]
        // await updateMessagesToSession(sessionId, payload)

        // FIXME: type
        const msgs = (payload as any).map((m: any) => {
          return {
            short_id: m.id || nanoid(),
            session_id: sessionId,
            created_at: new Date(m.createdAt || Date.now()),
            type: 'chat',
            role: m.role,
            content: m.content,
            latency,
            ...(m?.meta?.total_tokens && { total_tokens: m.meta.total_tokens }),
            ...(m?.meta?.raw && { raw: m.meta.raw }),
          }
        })
        const shouldSaveMsgs = msgs.slice(-2) // save the last 2 messages
        const queue = []
        for (const msg of shouldSaveMsgs) {
          queue.push(addMessage(msg))
        }
        if (reloadMessageId) queue.push(removeMessage(reloadMessageId))
        await Promise.all(queue)
      },
    },
    data: {
      id: messageId,
    },
  })

  return new Response(stream)
}
