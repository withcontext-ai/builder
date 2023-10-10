import { NextRequest, NextResponse } from 'next/server'
import { pick } from 'lodash'

import { getDataSplitPreview } from '@/db/datasets/documents/action'
import { getSegments } from '@/db/datasets/segment/actions'
import { DataProps } from '@/app/dataset/type'

export const maxDuration = 300

// get document split preview
export async function POST(req: NextRequest) {
  const { dataset_id, dataConfig, document_id, preview } = await req.json()
  const isPdf = dataConfig?.loaderType === 'pdf'
  const currentFiles = isPdf ? dataConfig?.files : dataConfig?.notedData

  const isAdd = document_id === 'add'
  if (!isAdd) {
    currentFiles[0].uid = document_id
  }
  const splitConfig = pick(dataConfig, [
    'splitType',
    'chunkSize',
    'chunkOverlap',
  ])

  const files = currentFiles?.reduce((m: DataProps[], item: DataProps) => {
    item.status = 1 //indexing
    item.updated_at = new Date()
    item = Object.assign(item, splitConfig)
    m.push(item)
    return m
  }, [])

  const newConfig = { ...splitConfig, files }
  const uid = !isAdd ? document_id : files?.[0]?.uid
  await getDataSplitPreview(dataset_id, { config: newConfig }, uid, preview)
  const data = await getSegments(dataset_id, uid)
  const segments =
    data?.segments?.length === 0
      ? [{ content: '', segment_id: '00' }]
      : data?.segments
  return NextResponse.json({
    data: { totalItems: data?.totalItems, segments },
    success: true,
  })
}
