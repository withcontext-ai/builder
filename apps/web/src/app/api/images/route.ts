import { NextRequest, NextResponse } from 'next/server'

import { generateIcon } from '@/db/apps/actions'

export async function POST(req: NextRequest) {
  const { prompt, type } = (await req.json()) as {
    prompt: string
    type: 'icon'
  }
  const result = type === 'icon' ? await generateIcon(prompt) : []
  return NextResponse.json({ success: true, data: result })
}
