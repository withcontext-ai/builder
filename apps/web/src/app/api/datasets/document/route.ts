import { NextRequest, NextResponse } from 'next/server'

import { editDataset, getDataset } from '@/db/datasets/actions'
import { DataProps } from '@/app/dataset/[dataset_id]/data/utils'

export async function getDocuments({ dataset_id }: { dataset_id: string }) {
  const datasetDetail = await getDataset(dataset_id)
  const { updated_at, status, config = {} } = datasetDetail

  // @ts-ignore
  const documents = datasetDetail?.config?.files || []
  return { documents, updated_at, status, config }
}

// // Delete a data
export async function DELETE(req: NextRequest) {
  const { dataset_id, uid } = await req.json()
  const { documents, config } = await getDocuments({ dataset_id })

  const files = documents?.filter((item: DataProps) => item?.uid !== uid)
  // @ts-ignore
  const newConfig = { ...config, files }
  const response = (await editDataset(dataset_id, { config: newConfig })) as any
  return NextResponse.json({
    success: true,
    data: { dataset_id, uid, response },
  })
}
