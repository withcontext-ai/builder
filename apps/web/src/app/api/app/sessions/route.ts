import { NextRequest, NextResponse } from 'next/server'
import { addSession, getSessions } from '@/db/actions/sessions'
import { NewSession } from '@/db/schema/sessions'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const appId = searchParams.get('appId')
  if (!appId) {
    return NextResponse.json({ success: false, message: 'appId is not found' })
  }
  const result = await getSessions(appId)
  return NextResponse.json({ success: true, data: result })
}

export async function POST(req: NextRequest) {
  const { app_id } = (await req.json()) as NewSession
  const result = await addSession(app_id)
  return NextResponse.json({ success: true, data: result })
}
