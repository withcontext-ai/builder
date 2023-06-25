import { NextResponse } from 'next/server'
import { addApp } from '@/db/actions/apps'
import { NewApp } from '@/db/schema/apps'

export async function POST(req: Request) {
  const { name, description, icon } = (await req.json()) as NewApp
  const result = await addApp({ name, description, icon })
  return NextResponse.json({ success: true, data: result })
}
