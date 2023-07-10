import { NextRequest, NextResponse } from 'next/server'

import { editDataset } from '@/db/datasets/actions'
import { NewDataset } from '@/db/datasets/schema'

// // Update a dataset
export async function POST(
  req: NextRequest,
  { params }: { params: { dataset_id: string } }
) {
  const { dataset_id } = params

  const body = (await req.json()) as Partial<NewDataset>
  await editDataset(dataset_id, body)
  return NextResponse.json({ success: true, data: { dataset_id, body } })
}
