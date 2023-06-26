import { NextRequest, NextResponse } from 'next/server'

// Get an app
export async function GET(
  req: NextRequest,
  { params }: { params: { app_id: string } }
) {
  const { app_id } = params
  return NextResponse.json({ success: true, data: { app_id } })
}

// TODO: Update an app
export async function PATCH(
  req: NextRequest,
  { params }: { params: { app_id: string } }
) {
  const { app_id } = params
  const body = await req.json()
  return NextResponse.json({ success: true, data: { app_id, body } })
}

// TODO: Delete an app
export async function DELETE(
  req: NextRequest,
  { params }: { params: { app_id: string; session_id: string } }
) {
  const { app_id } = params
  return NextResponse.json({ success: true, data: { app_id } })
}
