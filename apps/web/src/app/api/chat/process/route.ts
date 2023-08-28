import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Get an app
export async function POST(req: NextRequest) {
  const params = await req.json()
  const { api_session_id } = params
  // to get chat-process
  let { data } = await axios.post(
    `${process.env.AI_SERVICE_API_BASE_URL}/v1/chat-process/${api_session_id}`
  )
  if (data.status !== 200) {
    return
  }
  return NextResponse.json({ success: true, data })
}
