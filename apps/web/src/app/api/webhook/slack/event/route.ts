import { NextRequest, NextResponse } from 'next/server'
import { throttle } from 'lodash'

import { OpenAIStream } from '@/lib/openai-stream'

export const runtime = 'edge'
export const preferredRegion = 'cle1'
export const dynamic = 'force-dynamic'

const baseUrl = `${process.env.AI_SERVICE_API_BASE_URL}/v1`

function ask({
  url,
  token,
  channel,
  ts,
  text,
}: {
  url: string
  token: string
  channel: string
  text: string
  ts?: string
}) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      channel,
      text,
      ...(ts ? { ts } : {}),
    }),
  }).then((res) => res.json())
}

const throttledAsk = throttle(ask, 200)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.challenge) return NextResponse.json(body)

    if (
      body.event.type === 'message' &&
      !body.event.bot_id &&
      !body.event.message?.bot_id
    ) {
      console.log(JSON.stringify(body, null, 2))
      const apiSessionId = '' // TODO: get apiSessionId from db
      const content = body.event.text
      const payload = {
        session_id: apiSessionId,
        messages: [{ role: 'user', content }],
      }

      const token = '' // TODO: get token from db
      const channel = body.event.channel

      const result = await throttledAsk({
        url: 'https://slack.com/api/chat.postMessage',
        token,
        channel,
        text: '_Typing..._',
      })

      const ts = result.ts

      let completion = ''

      await OpenAIStream({
        baseUrl,
        payload,
        callback: {
          async onToken(text) {
            completion = completion + text
            await throttledAsk({
              url: 'https://slack.com/api/chat.update',
              token,
              channel,
              text: completion,
              ts,
            })
          },
          async onCompletion(completion, metadata) {
            setTimeout(() => {
              console.log('setTimeout')
              throttledAsk({
                url: 'https://slack.com/api/chat.update',
                token,
                channel,
                text: completion,
                ts,
              })
            }, 800)
          },
        },
        data: {},
      })

      return NextResponse.json(body)
    }

    return NextResponse.json(body)
  } catch (error: any) {
    console.log('error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
