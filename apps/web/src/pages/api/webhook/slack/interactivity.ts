// via https://github.com/vercel-labs/slacker/blob/main/pages/api/response.ts
import { NextApiRequest, NextApiResponse } from 'next'

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

    const payload = JSON.parse(req.body.payload) || {}
    console.log('payload:', payload)
    const type = payload.type
    if (type === 'block_actions') {
      const action_id = payload.actions?.[0]?.action_id
      if (action_id === 'create_session') {
        const app_id = payload.api_app_id
        const team_id = payload.team?.id
        const user_id = payload.user?.id
        const token = await getAccessToken(app_id, team_id)
        if (!token) throw new Error('access_token is not found')
        const slack = new SlackUtils(token)
        const { context_user_id } = await slack.addOrUpdateUser({
          app_id,
          team_id,
          user_id,
        })
        const context_app_id = payload.actions?.[0]?.value
        const { app, session } = await slack.createSession(
          context_user_id,
          context_app_id
        )
        const userApp = await slack.addOrUpdateUserApp({
          app_id,
          team_id,
          user_id,
          context_app_id,
          context_session_id: session.short_id,
        })
      }
    }

    return res.status(200).json({ success: true })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message })
  }
}
