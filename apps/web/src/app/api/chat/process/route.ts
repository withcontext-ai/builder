import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Get chat process
export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams
    const api_session_id = query.get('api_session_id') || ''

    let { data: res } = await axios.get(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/chat/session/${api_session_id}/process`
    )
    if (res.status !== 200) {
      throw new Error(`API service error: ${res.message}`)
    }

    return NextResponse.json({ success: true, data: res?.data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
