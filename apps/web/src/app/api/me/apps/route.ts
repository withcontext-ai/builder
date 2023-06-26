// import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { addApp, getApps } from '@/db/actions/apps'
import { NewApp } from '@/db/schema/apps'

export async function GET() {
  const result = await getApps()
  return NextResponse.json({ success: true, data: result })
}

export async function POST(req: NextRequest) {
  const { name, description, icon } = (await req.json()) as NewApp
  const result = await addApp({ name, description, icon })

  // revalidateTag('me.apps')

  return NextResponse.json({ success: true, data: result })
}
