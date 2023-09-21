// via https://github.com/vercel-labs/slacker/blob/main/pages/api/response.ts
import { NextApiRequest, NextApiResponse } from 'next'

import { addFeedback } from '@/db/messages/actions'
import { getAccessToken, SlackUtils } from '@/app/api/webhook/slack/utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        response_type: 'ephemeral',
        text: 'This endpoint only accepts POST requests',
      })
    }

    res.status(200).json({ success: true }) // response must be sent within 3 seconds

    const payload = JSON.parse(req.body.payload) || {}
    console.log('payload:', payload)
    const type = payload.type
    if (type === 'block_actions') {
      const app_id = payload.api_app_id
      const team_id = payload.team?.id
      const token = await getAccessToken(app_id, team_id)
      if (!token) throw new Error('access_token is not found')
      const slack = new SlackUtils(token)

      const action_id = payload.actions?.[0]?.action_id
      if (action_id === 'create_session') {
        const user_id = payload.user?.id
        const { context_user_id } = await slack.addOrUpdateUser({
          app_id,
          team_id,
          user_id,
        })
        const action_value = payload.actions?.[0]?.value
        const { channel_id, context_app_id } = JSON.parse(action_value) || {}
        const { app, session } = await slack.createSession(
          context_user_id,
          context_app_id
        )
        await slack.addOrUpdateUserApp({
          app_id,
          team_id,
          user_id,
          context_app_id,
          context_session_id: session.short_id,
        })
        const text = `Chat with ${app.name}.`
        await slack.postMessage({ channel: channel_id, text })
        if (app.opening_remarks) {
          await slack.postMessage({
            channel: channel_id,
            text: app.opening_remarks,
          })
        }
      } else if (action_id === 'chat_feedback_good') {
        const messageId = payload.actions?.[0]?.value
        if (messageId) {
          await addFeedback({ messageId, feedback: 'good' })
          const channel = payload.channel?.id
          const ts = payload.message?.ts
          const text = payload.message?.text
          const blocks = [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text,
              },
            },
            {
              type: 'section',
              text: {
                type: 'plain_text',
                text: '👍',
                emoji: true,
              },
            },
          ]
          await slack.updateMessage({
            channel,
            ts,
            blocks,
            text,
          })
        }
      } else if (action_id === 'chat_feedback_bad') {
        const messageId = payload.actions?.[0]?.value
        if (messageId) {
          await addFeedback({ messageId, feedback: 'bad' })
          const channel = payload.channel?.id
          const ts = payload.message?.ts
          const text = payload.message?.text
          const blocks = [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text,
              },
            },
            {
              type: 'section',
              text: {
                type: 'plain_text',
                text: '👎',
                emoji: true,
              },
            },
          ]
          await slack.updateMessage({
            channel,
            ts,
            blocks,
            text,
          })
        }
      }
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}
