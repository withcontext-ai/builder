import { NextRequest, NextResponse } from 'next/server'
import { assign, omit } from 'lodash'

import { editDataset, getDataset } from '@/db/datasets/actions'
import { FileProps } from '@/components/upload/utils'
import { DataProps } from '@/app/dataset/[dataset_id]/data/utils'

export async function getDocuments({ dataset_id }: { dataset_id: string }) {
  const datasetDetail = await getDataset(dataset_id)
  const { updated_at, status } = datasetDetail
  const config = datasetDetail?.config || {}
  // @ts-ignore
  const documents = datasetDetail?.config?.files || []
  return { documents, updated_at, status, config }
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

// add datas
export async function POST(req: NextRequest) {
  const { dataset_id, dataConfig } = await req.json()
  const { documents, config } = await getDocuments({ dataset_id })
  // to complete the history data
  // const existedFiles = documents?.reduce((m: DataProps[], item: any) => {
  //   item.config = omit(dataConfig, 'files')
  //   return m
  // }, [])
  const files = [...documents, ...dataConfig?.files]
  const newConfig = { ...config, files }
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
  const current = dataConfig?.files?.[0]
  const currentConfig = omit(dataConfig, ['files', 'notedData'])
  const file = assign(current, currentConfig)
  documents[index] = file
  const newConfig = { ...config, files: documents }
  const response = (await editDataset(dataset_id, { config: newConfig })) as any
  return NextResponse.json({
    success: true,
    data: { dataset_id, response },
  })
}
