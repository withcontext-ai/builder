import { NextRequest, NextResponse } from 'next/server'
import { omit } from 'lodash'

import { editDataset } from '@/db/datasets/actions'
import { getDocuments } from '@/db/datasets/documents/action'
import { addDocuments, getDocumentByTable } from '@/db/documents/action'
import { DataProps } from '@/app/dataset/[dataset_id]/settings/documents/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: { dataset_id: string } }
) {
  const query = req.nextUrl.searchParams
  const pageSize = parseInt(query.get('pageSize') || '')
  const pageIndex = parseInt(query.get('pageIndex') || '')
  const search = query.get('search') || ''
  const dataset_id = query.get('dataset_id') || ''
  const data = await getDocumentByTable({
    dataset_id,
    params: { pageSize, pageIndex, search },
  })

  return NextResponse.json({ success: true, data })
}

// // Delete a data
export async function DELETE(req: NextRequest) {
  const { dataset_id, uid } = await req.json()
  const { documents, config } = await getDocuments({ dataset_id })
  const files = documents?.filter((item: DataProps) => item?.uid !== uid)
  const newConfig = { ...config, files }
  const response = (await editDataset(dataset_id, { config: newConfig })) as any
  return NextResponse.json({
    success: true,
    data: { dataset_id, uid, response },
  })
}

// add data
export async function POST(req: NextRequest) {
  const { dataset_id, dataConfig } = await req.json()
  const { documents, config } = await getDocuments({ dataset_id })
  const isPdf = dataConfig?.loaderType === 'pdf'
  let files
  if (isPdf) {
    files = [...documents, ...dataConfig?.files]
  } else {
    files = [...documents, ...dataConfig?.notedData]
  }
  files?.map((item) => (item.updated_at = new Date()))
  const newConfig = { ...config, files }
  const response = await addDocuments({
    documents: files,
    config: newConfig,
    dataset_id,
    type: dataConfig?.loaderType,
  })
  // const response = (await editDataset(dataset_id, { config: newConfig })) as any
  return NextResponse.json({
    success: true,
    data: { dataset_id, response },
  })
}

// edit data
export async function PATCH(req: NextRequest) {
  const { dataset_id, dataConfig, document_id } = await req.json()
  const { documents, config } = await getDocuments({ dataset_id })

  // to replace the current
  const index = documents?.findIndex((item: any) => item?.uid === document_id)
  let current = dataConfig?.files?.[0]
  const isPdf = dataConfig?.loaderType === 'pdf'
  if (!isPdf) {
    current = dataConfig?.notedData?.[0]
  }
  current = omit(current, ['splitType', 'chunkSize', 'chunkOverlap'])
  const currentConfig = omit(dataConfig, ['files', 'notedData', 'icon'])
  current = Object.assign(current, currentConfig)
  current.updated_at = new Date()

  documents[index] = current
  const newConfig = { ...config, files: documents }
  const response = (await editDataset(dataset_id, { config: newConfig })) as any
  return NextResponse.json({
    success: true,
    data: { dataset_id, response },
  })
}
