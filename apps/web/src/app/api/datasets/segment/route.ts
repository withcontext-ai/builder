import { NextRequest } from 'next/server'

import { addSegment, editSegment } from '@/db/segment/actions'

// add segment
export async function POST(req: NextRequest) {
  const { dataset_id, uid, content } = await req.json()
  const data = await addSegment(dataset_id, uid, content)
  return data
}

// edit segment
export async function PATCH(req: NextRequest) {
  const { dataset_id, uid, content, segment_id } = await req.json()
  const data = await editSegment(dataset_id, uid, segment_id, content)
  return data
}
