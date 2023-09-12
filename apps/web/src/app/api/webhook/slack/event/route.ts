import { NextRequest, NextResponse } from 'next/server'

import { OpenAIStream } from '@/lib/openai-stream'

export const runtime = 'edge'
export const preferredRegion = 'cle1'
export const dynamic = 'force-dynamic'

const baseUrl = `${process.env.AI_SERVICE_API_BASE_URL}/v1`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.challenge) return NextResponse.json(body)

    if (
      body.event.type === 'message' &&
      !body.event.bot_id &&
      !body.event.message?.bot_id
    ) {
      const apiSessionId = '' // TODO: get apiSessionId from db
      const content = body.event.text
      const payload = {
        session_id: apiSessionId,
        messages: [{ role: 'user', content }],
      }

      const token = '' // TODO: get token from db
      const channel = body.event.channel

      const result = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel,
          text: '_Typing..._',
        }),
      }).then((res) => res.json())

      const ts = result.ts

      let completion = ''

      await OpenAIStream({
        baseUrl,
        payload,
        callback: {
          async onToken(text) {
            completion = completion + text
            console.log('onToken completion:', completion)

            const result = await fetch('https://slack.com/api/chat.update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                channel,
                ts,
                text: completion,
              }),
            }).then((res) => res.json())
          },
          async onCompletion(completion, metadata) {
            console.log('onCompletion completion:', completion)
            const result = await fetch('https://slack.com/api/chat.update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                channel,
                ts,
                text: completion,
              }),
            }).then((res) => res.json())
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
