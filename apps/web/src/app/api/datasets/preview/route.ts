import { NextRequest, NextResponse } from 'next/server'
import { omit, pick } from 'lodash'

import {
  getDataSplitPreview,
  getDocuments,
} from '@/db/datasets/documents/action'
import { getSegments } from '@/db/datasets/segment/actions'

// get document split preview
export async function POST(req: NextRequest) {
  const { dataset_id, dataConfig, document_id, preview } = await req.json()
  const { config } = await getDocuments({ dataset_id })
  const isPdf = dataConfig?.loaderType === 'pdf'
  let files
  if (isPdf) {
    files = dataConfig?.files
  } else {
    files = dataConfig?.notedData
  }
  const isAdd = document_id === 'add'
  if (!isAdd) {
    files[0].uid = document_id
    const currentConfig = omit(dataConfig, ['files', 'notedData', 'icon'])
    files[0] = Object.assign(files[0], currentConfig)
  }

  const splitConfig = pick(dataConfig, [
    'splitType',
    'chunkSize',
    'chunkOverlap',
  ])
  const newConfig = { ...splitConfig, files }
  const uid = !isAdd ? document_id : files?.[0]?.uid
  await getDataSplitPreview(dataset_id, { config: newConfig }, uid, preview)
  const { segments } = await getSegments(dataset_id, uid)

  return NextResponse.json({
    success: true,
    data:
      segments?.length !== 0 ? segments : [{ content: '', segment_id: '01' }],
  })
}
