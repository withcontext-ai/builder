import { NextRequest, NextResponse } from 'next/server'
import { removeSession } from '@/db/actions/sessions'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { app_id: string; session_id: string } }
) {
  const { app_id, session_id } = params
  const result = await removeSession(app_id, session_id)
  return NextResponse.json({ success: true, data: result })
}
