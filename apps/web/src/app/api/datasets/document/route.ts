import { NextRequest, NextResponse } from 'next/server'

import { editDataset, getDataset } from '@/db/datasets/actions'

export async function getDocuments({ dataset_id }: { dataset_id: string }) {
  const datasetDetail = await getDataset(dataset_id)
  const { updated_at, status, config } = datasetDetail

  // @ts-ignore
  const documents = datasetDetail?.config?.files || []

  return { documents, updated_at, status, config }
}

// // Delete a data
export async function DELETE(req: NextRequest) {
  const { dataset_id, uid, config } = await req.json()
  const { documents } = await getDocuments({ dataset_id })

  const files = documents?.filter((item: any) => item?.uid !== uid)
  const newConfig = { ...config, files }
  const response = (await editDataset(dataset_id, { config: newConfig })) as any
  return NextResponse.json({
    success: true,
    data: { dataset_id, uid, response },
  })
}
