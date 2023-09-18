import { NextRequest, NextResponse } from 'next/server'

import { getTeamList } from '@/db/slack_teams/actions'

export async function GET() {
  const data = await getTeamList()
  return NextResponse.json({ success: true, data })
}
