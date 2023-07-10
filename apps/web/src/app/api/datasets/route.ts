import { NextRequest, NextResponse } from 'next/server'

import { addDataset } from '@/db/datasets/actions'
import { NewDataset } from '@/db/datasets/schema'

// create a dataset
export async function POST(req: NextRequest) {
  const params = (await req.json()) as NewDataset
  const result = await addDataset(params)
  return NextResponse.json({ success: true, data: result })
}
