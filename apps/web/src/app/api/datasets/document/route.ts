import { NextRequest, NextResponse } from 'next/server'
import { omit, pick } from 'lodash'

import { editDataset } from '@/db/datasets/actions'
import { getDocuments } from '@/db/datasets/documents/action'
import { DataProps } from '@/app/dataset/type'

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
  const { documents } = await getDocuments({ dataset_id })
  const isPdf = dataConfig?.loaderType === 'pdf'
  const currentConfig = pick(dataConfig, [
    'splitType',
    'chunkSize',
    'chunkOverlap',
    'uid',
  ])

  let files
  if (isPdf) {
    dataConfig?.files?.map((item: any) => {
      item.status = 1
      item.updated_at = new Date()
      return { item, ...currentConfig }
    })
    files = [...dataConfig?.files, ...documents]
  } else {
    dataConfig?.notedData?.map((item: any) => {
      item.status = 1
      item.updated_at = new Date()
      return { item, ...currentConfig }
    })
    files = [...dataConfig?.notedData, ...documents]
  }
  const newConfig = { ...currentConfig, files }
  const response = (await editDataset(dataset_id, { config: newConfig })) as any
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
  current = omit(current, ['splitType', 'chunkSize', 'chunkOverlap', 'uid'])
  const currentConfig = omit(dataConfig, ['files', 'notedData', 'icon'])
  current = Object.assign(current, currentConfig)
  current.updated_at = new Date()
  current.uid = document_id
  current.status = 1 //indexing

  documents[index] = current
  const newConfig = { ...currentConfig, files: documents }
  const response = (await editDataset(dataset_id, { config: newConfig })) as any
  return NextResponse.json({
    success: true,
    data: { dataset_id, response },
  })
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams
  const dataset_id = query.get('dataset_id') || ''
  const { documents } = await getDocuments({ dataset_id })
  const data = documents?.filter((item: DataProps) => item?.type !== 'pdf')
  return NextResponse.json({
    success: true,
    data,
  })
}
