import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs'
import { throttle } from 'lodash'
import * as EventsApi from 'seratch-slack-types/events-api'

import { OpenAIStream } from '@/lib/openai-stream'
import { createSlackClient } from '@/lib/slack'

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

function postMessage({
  token,
  channel,
  text,
}: {
  token: string
  channel: string
  text: string
}) {
  const client = createSlackClient(token)
  return client.chat.postMessage({
    channel,
    text,
  })
}

const throttledPostMessage = throttle(postMessage, 200)

function updateMessage({
  token,
  channel,
  ts,
  text,
}: {
  token: string
  channel: string
  text: string
  ts: string
}) {
  const client = createSlackClient(token)
  return client.chat.update({
    channel,
    ts,
    text,
  })
}

const throttledUpdateMessage = throttle(updateMessage, 200)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log(JSON.stringify(body, null, 2))

    if (body.challenge) return NextResponse.json(body)

    const isFromUser =
      body.event?.type === 'message' &&
      !body.event?.bot_id &&
      !body.event?.message?.bot_id

    if (isFromUser) {
      const message = body as EventsApi.MessagePayload
      if (!message.event) throw new Error('message.event is undefined')
      const teamId = message.team_id as string
      const userId = message.event.user as string

      const token = '' // TODO: get token from db
      const client = createSlackClient(token)
      const { user } = await client.users.info({ user: userId })
      console.log('user:', user)

      const clerkUser = await clerkClient.users.createUser({
        emailAddress: ['genshang@gmail.com'],
        firstName: user?.profile?.first_name,
        lastName: user?.profile?.last_name,
        skipPasswordChecks: false,
        skipPasswordRequirement: false,
      })
      console.log('clerkUser:', clerkUser)

      const apiSessionId = '' // TODO: get apiSessionId from db
      const content = message.event.text
      const payload = {
        session_id: apiSessionId,
        messages: [{ role: 'user', content }],
      }

      const channel = message.event.channel
      if (!channel) throw new Error('channel is undefined')

      const result = await postMessage({
        token,
        channel,
        text: '_Thinking..._',
      })

      const ts = result.ts

      if (!ts) {
        return NextResponse.json(body)
      }

      let completion = ''

      await OpenAIStream({
        baseUrl,
        payload,
        callback: {
          async onToken(text) {
            completion = completion + text
            await throttledUpdateMessage({
              token,
              channel,
              text: completion,
              ts,
            })
          },
          async onCompletion(completion, metadata) {
            setTimeout(() => {
              throttledUpdateMessage({
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