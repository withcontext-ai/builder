import { INTERNALS } from 'next/dist/server/web/spec-extension/request'
import { NextRequest, NextResponse } from 'next/server'

import { addDataset } from '@/db/datasets/actions'
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
// Create an app for the authenticated user
export async function POST(req: NextRequest) {
  const params = (await req.json()) as NewDataset
  const result = await addDataset(params)
  return NextResponse.json({ success: true, data: result })
}

// // Update a dataset
// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { app_id: string } }
// ) {
//   const { app_id } = params
//   const body = (await req.json()) as Partial<NewApp>
//   await editApp(app_id, body)
//   return NextResponse.json({ success: true, data: { app_id, body } })
// }

// // Delete a dataset
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { app_id: string } }
// ) {
//   const { app_id } = params
//   await removeApp(app_id)
//   return NextResponse.json({ success: true, data: { app_id } })
// }
