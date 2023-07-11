import { NextRequest, NextResponse } from 'next/server'

import { editDataset, removeDataset } from '@/db/datasets/actions'
import { NewDataset } from '@/db/datasets/schema'

// Get a dataset
export async function GET(
  req: NextRequest,
  { params }: { params: { dataset_id: string } }
) {
  const { dataset_id } = params
  return NextResponse.json({ success: true, data: { dataset_id } })
}

// // Update a dataset
export async function PATCH(
  req: NextRequest,
  { params }: { params: { dataset_id: string } }
) {
  const { dataset_id } = params

  const body = (await req.json()) as Partial<NewDataset>
  await editDataset(dataset_id, body)
  return NextResponse.json({ success: true, data: { dataset_id, body } })
}

// // Delete a dataset
export async function DELETE(
  req: NextRequest,
  { params }: { params: { dataset_id: string } }
) {
  const { dataset_id } = params
  await removeDataset(dataset_id)
  return NextResponse.json({ success: true, data: { dataset_id } })
}
