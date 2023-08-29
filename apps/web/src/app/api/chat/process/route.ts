import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

// Get chat process
export async function POST(req: NextRequest) {
  const params = await req.json()
  const { api_session_id } = params
  let { data } = await axios.post(
    `${process.env.AI_SERVICE_API_BASE_URL}//${api_session_id}`
  )
  if (data.status !== 200) {
    return
  }
  return NextResponse.json({ success: true, data })
}
