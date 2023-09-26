import { NextRequest, NextResponse } from 'next/server'
import { pick } from 'lodash'

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
  const { documents, config: basicsConfig } = await getDocuments({ dataset_id })
  const isPdf = dataConfig?.loaderType === 'pdf'
  const currentConfig = pick(dataConfig, [
    'splitType',
    'chunkSize',
    'chunkOverlap',
    'loaderType',
  ])

  let files = isPdf ? dataConfig?.files : dataConfig?.notedData
  files?.map((item: DataProps) => {
    item.status = 1 //indexing
    item.updated_at = new Date()
    item = Object.assign(item, currentConfig)
    return item
  })
  files = [...files, ...documents]
  const newConfig = { ...basicsConfig, ...currentConfig, files }
  const response = (await editDataset(dataset_id, { config: newConfig })) as any
  return NextResponse.json({
    success: true,
    data: { dataset_id, response },
  })
}

// edit data
export async function PATCH(req: NextRequest) {
  const { dataset_id, dataConfig, document_id } = await req.json()
  const { documents, config: basicsConfig } = await getDocuments({ dataset_id })
  const isPdf = dataConfig?.loaderType === 'pdf'

  // to replace the current
  const index = documents?.findIndex(
    (item: DataProps) => item?.uid === document_id
  )
  const current = isPdf ? dataConfig?.files?.[0] : dataConfig?.notedData?.[0]
  const fileProps = Object.assign(pick(current, ['type', 'name', 'url']), {
    uid: document_id,
    status: 1,
    updated_at: new Date(),
  })
  const splitConfig = pick(dataConfig, [
    'chunkSize',
    'chunkOverlap',
    'splitType',
  ])

  const currentFile = Object.assign(fileProps, splitConfig)
  documents[index] = currentFile

  const newConfig = { ...basicsConfig, ...splitConfig, files: documents }
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
