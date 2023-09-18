import { NextRequest, NextResponse } from 'next/server'

import { SlackUtils } from '../utils'

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams
    const code = query.get('code')
    if (!code) throw new Error('code is undefined')

    const client_id = process.env.SLACK_CLIENT_ID
    const client_secret = process.env.SLACK_CLIENT_SECRET
    const redirect_uri = `${process.env.BASE_URL}/api/webhook/slack/redirect_uri`

    if (!client_id || !client_secret)
      throw new Error('client_id or client_secret is undefined')

    let slack = new SlackUtils('')
    const accessInfo = await slack.client.oauth.v2.access({
      client_id,
      client_secret,
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    })
    if (!accessInfo.app_id) throw new Error('app_id is undefined')
    if (!accessInfo.access_token) throw new Error('app_id is undefined')
    if (!accessInfo.team?.id) throw new Error('team_id is undefined')

    slack = new SlackUtils(accessInfo.access_token)
    const teamInfo = await slack.client.team.info({ team: accessInfo.team?.id })
    if (!teamInfo.team) throw new Error('team is undefined')

    const team = {
      app_id: accessInfo.app_id,
      team_id: accessInfo.team.id,
      team_name: teamInfo.team.name ?? 'Default Team name',
      team_url: teamInfo.team.url,
      team_icon: teamInfo.team.icon?.image_132 || '',
      access_token: accessInfo.access_token,
      scope: accessInfo.scope,
    }
    const slack_team = await slack.addOrUpdateTeam(team)

    const user = {
      app_id: accessInfo.app_id,
      team_id: accessInfo.team.id,
      user_id: accessInfo.authed_user?.id ?? '',
    }
    const slack_user = await slack.addOrUpdateUser(user)

    const data = {
      slack_team,
      slack_user,
    }

    return NextResponse.json({ success: false, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
