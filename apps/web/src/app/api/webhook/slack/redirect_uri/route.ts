import { NextRequest, NextResponse } from 'next/server'

import { createSlackClient } from '@/lib/slack'

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams
    const code = query.get('code')
    if (!code) throw new Error('code is undefined')

    const client_id = process.env.SLACK_CLIENT_ID
    const client_secret = process.env.SLACK_CLIENT_SECRET
    const redirect_uri =
      'https://local.lililulu.com/api/webhook/slack/redirect_uri'

    if (!client_id || !client_secret)
      throw new Error('client_id or client_secret is undefined')

    const slackClient = createSlackClient('')
    const response = await slackClient.oauth.v2.access({
      client_id,
      client_secret,
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    })
    // TODO: save (app_id, team_id, team_name, access_token, scope) to db

    return NextResponse.redirect('/')
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
