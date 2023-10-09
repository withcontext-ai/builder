import { NextRequest, NextResponse } from 'next/server'

import {
  addSegment,
  editSegment,
  getSegments,
} from '@/db/datasets/segment/actions'

// get segments
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams
  const dataset_id = query.get('dataset_id') || ''
  const uid = query.get('uid') || ''
  const limit = parseInt(query.get('pageSize') || '')
  const page = parseInt(query.get('pageIndex') || '')
  const pageSize = page ? page - 1 : 0
  const search = query.get('search') || ''
  const offset = pageSize * limit
  const res = await getSegments(dataset_id, uid, search, offset, limit)
  const data = res?.data
  const segments =
    data?.segments?.length === 0
      ? [{ content: '', segment_id: '01' }]
      : data?.segments
  return NextResponse.json({
    data: { totalItems: data?.totalItems, segments },
    success: true,
  })
}

// add segment
export async function POST(req: NextRequest) {
  const { dataset_id, uid, content } = await req.json()
  const data = await addSegment(dataset_id, uid, content)
  return NextResponse.json({ success: true, data })
}

// edit segment
export async function PATCH(req: NextRequest) {
  const { dataset_id, uid, content, segment_id } = await req.json()
  const data = await editSegment(dataset_id, uid, segment_id, content)
  return NextResponse.json({ success: true, data })
}
