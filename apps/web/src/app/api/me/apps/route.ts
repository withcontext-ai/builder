import { NextRequest, NextResponse } from 'next/server'
import { addApp, getApps } from '@/db/actions/apps'
import { NewApp } from '@/db/schema/apps'

// List apps for the authenticated user
export async function GET() {
  const result = await getApps()
  return NextResponse.json({ success: true, data: result })
}

// Create an app for the authenticated user
export async function POST(req: NextRequest) {
  const { name, description, icon } = (await req.json()) as NewApp
  const result = await addApp({ name, description, icon })
  return NextResponse.json({ success: true, data: result })
}
