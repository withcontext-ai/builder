import { NextRequest, NextResponse } from 'next/server'

import { api } from '@/lib/api'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Get chat process
export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams
    const api_session_id = query.get('api_session_id') || ''
    let data = await api.get(`/v1/chat/session/${api_session_id}/process`)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
