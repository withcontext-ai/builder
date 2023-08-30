import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Get chat process
export async function GET(
  req: NextRequest,
  { params }: { params: { api_session_id: string } }
) {
  const { api_session_id } = params

  let { data: res } = await axios.get(
    `${process.env.AI_SERVICE_API_BASE_URL}/v1/chat/session/${api_session_id}/process`
  )
  if (res.status !== 200) {
    throw new Error(`API service error: ${res.message}`)
  }

  const data = res?.data

  return NextResponse.json({ success: true, data: { api_session_id } })
}
