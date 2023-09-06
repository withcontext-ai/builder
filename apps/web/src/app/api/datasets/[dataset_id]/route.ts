import { NextRequest, NextResponse } from 'next/server'

import {
  addDataset,
  editDataset,
  getDataset,
  removeDataset,
} from '@/db/datasets/actions'
import { NewDataset } from '@/db/datasets/schema'

// create a dataset
export async function POST(req: NextRequest) {
  const params = (await req.json()) as NewDataset
  const result = await addDataset(params)
  return NextResponse.json({ success: true, data: result })
}

// Get the dataset document
export async function GET(
  req: NextRequest,
  { params }: { params: { dataset_id: string } }
) {
  const { dataset_id } = params
  const query = req.nextUrl.searchParams
  const pageSize = parseInt(query.get('pageSize') || '')
  const page = parseInt(query.get('pageIndex') || '')
  const search = query.get('search') || ''
  if (isNaN(pageSize) || isNaN(page)) {
    return new Response('Bad Request', { status: 400 })
  }

  const datasetDetail = await getDataset(dataset_id)
  const { updated_at, status } = datasetDetail
  // @ts-ignore
  const documents = datasetDetail?.config?.files || []
  let res = documents
  if (search) {
    res = documents?.filter((item: any) => item?.name?.includes(search))
  }
  res = res?.slice(page * pageSize, pageSize * (page + 1))

  // Compat the historical data
  const result = res?.reduce((m: any[], item: any) => {
    if (!item?.update_at) {
      item.update_at = updated_at
    }
    if (!item?.status) {
      item.status = status
    }
    m.push(item)
    return m
  }, [])

  return NextResponse.json({ success: true, data: result })
}

// // Update a dataset
export async function PATCH(
  req: NextRequest,
  { params }: { params: { dataset_id: string } }
) {
  const { dataset_id } = params

  const body = (await req.json()) as Partial<NewDataset>
  const response = (await editDataset(dataset_id, body)) as any
  if (response?.error) {
    return NextResponse.json({ success: false, error: response?.error })
  } else {
    return NextResponse.json({
      success: true,
      data: { dataset_id, body },
    })
  }
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
