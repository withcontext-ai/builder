import { NextRequest, NextResponse } from 'next/server'

import { editDataset, removeDataset } from '@/db/datasets/actions'
import { NewDataset } from '@/db/datasets/schema'
import { SchemaProps } from '@/app/dataset/[dataset_id]/settings/setting-page'

// // Update a dataset
export async function PATCH(
  req: NextRequest,
  { params }: { params: { dataset_id: string; api_dataset_id: string } }
) {
  const { dataset_id, api_dataset_id } = params

  const body = (await req.json()) as SchemaProps
  await editDataset(dataset_id, api_dataset_id, body)
  return NextResponse.json({ success: true, data: { dataset_id, body } })
}

// // Delete a dataset
export async function DELETE(
  req: NextRequest,
  { params }: { params: { dataset_id: string; api_dataset_id: string } }
) {
  console.log()
  const { dataset_id, api_dataset_id } = params
  await removeDataset(dataset_id, api_dataset_id)
  return NextResponse.json({ success: true, data: { dataset_id } })
}
