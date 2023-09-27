import { NextRequest, NextResponse } from 'next/server'
import { pick } from 'lodash'

import { addDataset, editDataset, removeDataset } from '@/db/datasets/actions'
import { getDocuments } from '@/db/datasets/documents/action'
import { NewDataset } from '@/db/datasets/schema'
import { DataProps } from '@/app/dataset/type'

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
  const { documents } = await getDocuments({ dataset_id })
  let count = Math.ceil(documents?.length / pageSize)
  let res = documents
  if (search) {
    const exc = new RegExp(`${search}`, 'i')
    res = documents?.filter((item: DataProps) => exc.test(item?.name))
    count = Math.ceil(res?.length / pageSize)
  }
  res = res?.slice(page * pageSize, pageSize * (page + 1))

  return NextResponse.json({ success: true, data: { data: res, count } })
}

type EditParams = Partial<NewDataset> & {
  isSynchrony?: boolean
  isEditBasics?: boolean
}
// // Update a dataset
export async function PATCH(
  req: NextRequest,
  { params }: { params: { dataset_id: string } }
) {
  const { dataset_id } = params

  const body = (await req.json()) as EditParams
  const isSynchrony = body?.isSynchrony
  const isEditBasics = body?.isEditBasics
  const { config, name, documents } = await getDocuments({ dataset_id })
  const basicsConfig = pick(config, 'isEditBasics')
  const currentConfig: Partial<NewDataset> = isSynchrony
    ? { config, name }
    : isEditBasics
    ? { config: { ...basicsConfig, files: documents } }
    : body

  // edit basics or synchrony noted data
  const response = (await editDataset(dataset_id, currentConfig)) as any

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
