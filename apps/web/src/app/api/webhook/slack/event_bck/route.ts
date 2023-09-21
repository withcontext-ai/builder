import { NextRequest, NextResponse } from 'next/server'

import { OpenAIStream } from '@/lib/openai-stream'
import { nanoid } from '@/lib/utils'
import { addMessage } from '@/db/messages/actions'

import { getAccessToken, SlackUtils } from '../utils'

export const dynamic = 'force-dynamic'

const baseUrl = `${process.env.AI_SERVICE_API_BASE_URL}/v1`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.challenge) return NextResponse.json(body)
    NextResponse.json(body) // still not working

    const isUserMessage =
      body.event?.type === 'message' &&
      !body.event?.bot_id &&
      !body.event?.message?.bot_id

    if (isUserMessage) {
      console.log('!!! message, from user')
      const message = body as any
      const app_id = message.api_app_id
      if (!app_id) throw new Error('app_id is undefined')
      const team_id = message.team_id
      if (!team_id) throw new Error('team_id is undefined')
      if (!message.event) throw new Error('message.event is undefined')
      const user_id = message.event.user
      if (!user_id) throw new Error('user_id is undefined')
      const channel_id = message.event.channel
      if (!channel_id) throw new Error('channel_id is undefined')

      const token = await getAccessToken(app_id, team_id)
      const slack = new SlackUtils(token)

      const result = await slack.postMessage({
        channel: channel_id,
        text: '_Thinking..._',
      })

      const slackUser = await slack.addOrUpdateUser({
        app_id,
        team_id,
        user_id,
      })

      const { session_id, api_session_id } = await slack.getCurrentSession(
        app_id,
        team_id,
        user_id
      )
      if (!api_session_id) throw new Error('api_session_id is undefined')

      const messages = await slack.getMessages(session_id)
      const formattedMessages = []
      for (const message of messages) {
        if (message.query)
          formattedMessages.push({ role: 'user', content: message.query })
        if (message.answer)
          formattedMessages.push({ role: 'assistant', content: message.answer })
      }

      const content = message.event.text
      const payload = {
        session_id: api_session_id,
        messages: [...formattedMessages, { role: 'user', content }],
      }
      console.log('payload:', payload)

      const ts = result.ts

      if (!ts) {
        return NextResponse.json(body)
      }

      let completion = ''

      const requestTimestamp = Date.now()

      await OpenAIStream({
        baseUrl,
        payload,
        callback: {
          async onToken(text) {
            completion = completion + text
            await slack.updateMessage({
              channel: channel_id,
              ts,
              text: completion,
            })
          },
          async onCompletion(completion, metadata) {
            setTimeout(() => {
              slack.updateMessage({ channel: channel_id, ts, text: completion })
            }, 800)

            const responseTimestamp = Date.now()
            const latency = responseTimestamp - requestTimestamp
            const newMessage = {
              type: 'chat',
              short_id: nanoid(),
              session_id,
              query: content,
              answer: completion,
              feedback: null,
              feedback_content: null,
              latency,
              ...(metadata?.token?.total_tokens && {
                total_tokens: metadata.token.total_tokens,
              }),
              ...(metadata?.raw && { raw: metadata.raw }),
            }
            await addMessage(newMessage)
          },
        },
        data: {},
      })

      return NextResponse.json(body)
    }

    if (body.event?.type === 'app_home_opened') {
      const payload = body as any
      if (!payload.event) throw new Error('payload.event is undefined')
      const user_id = payload.event.user
      const app_id = payload.api_app_id
      const team_id = payload.team_id
      const channel_id = payload.event?.channel
      if (!user_id) throw new Error('user_id is undefined')
      if (!app_id) throw new Error('api_app_id is undefined')
      if (!team_id) throw new Error('team_id is undefined')
      if (!channel_id) throw new Error('channel_id is undefined')

      const token = await getAccessToken(app_id, team_id)
      if (!token) throw new Error('access_token is not found')
      const slack = new SlackUtils(token)
      await slack.publishHomeViews(app_id, team_id, user_id, channel_id)
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
