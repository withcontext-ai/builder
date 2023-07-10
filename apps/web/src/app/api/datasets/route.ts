import { INTERNALS } from 'next/dist/server/web/spec-extension/request'
import { NextRequest, NextResponse } from 'next/server'

import { addDataset, editDataset } from '@/db/datasets/actions'
import { NewDataset } from '@/db/datasets/schema'

// Get a dataset
export async function GET(
  req: NextRequest,
  { params }: { params: { dataset_id: string } }
) {
  const { dataset_id } = params
  return NextResponse.json({ success: true, data: { dataset_id } })
}

// create a dataset
// Create an dataset for the authenticated user
export async function POST(req: NextRequest) {
  const params = (await req.json()) as NewDataset
  const result = await addDataset(params)
  return NextResponse.json({ success: true, data: result })
}

// // Delete a dataset
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { app_id: string } }
// ) {
//   const { app_id } = params
//   await removeApp(app_id)
//   return NextResponse.json({ success: true, data: { app_id } })
// }
