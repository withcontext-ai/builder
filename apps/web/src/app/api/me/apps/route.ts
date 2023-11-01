import { NextRequest, NextResponse } from 'next/server'

import { addApp, getApps } from '@/db/apps/actions'
import { NewApp } from '@/db/apps/schema'

// List apps for the authenticated user
export async function GET() {
  const result = await getApps()
  return NextResponse.json({ success: true, data: result })
}

// Create an app for the authenticated user
export async function POST(req: NextRequest) {
  const { isCopy = false, ...params } = (await req.json()) as NewApp & {
    isCopy?: boolean
  }
  const response = (await addApp(params, isCopy)) as any
  if (response.error) {
    return NextResponse.json({ success: false, error: response.error })
  } else {
    return NextResponse.json({ success: true, data: response })
  }
}
