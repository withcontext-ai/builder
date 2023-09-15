import { NextRequest, NextResponse } from 'next/server'

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
  const newConfig = { ...config, files }
  const uid = document_id !== 'add' ? document_id : files?.[0]?.uid
  await getDataSplitPreview(dataset_id, { config: newConfig }, uid, preview)
  const { segments } = await getSegments(dataset_id, uid)
  return NextResponse.json({
    success: true,
    data: segments || [],
  })
}
