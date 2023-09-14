import { NextRequest } from 'next/server'

import {
  getDataSplitPreview,
  getDocuments,
} from '@/db/datasets/documents/action'

// get document split preview
export async function PATCH(req: NextRequest) {
  const { dataset_id, dataConfig, document_id, preview } = await req.json()
  const { documents, config } = await getDocuments({ dataset_id })
  const isPdf = dataConfig?.loaderType === 'pdf'
  let files
  if (isPdf) {
    files = [...documents, ...dataConfig?.files]
  } else {
    files = [...documents, ...dataConfig?.notedData]
  }
  const newConfig = { ...config, files }
  const data = await getDataSplitPreview(
    dataset_id,
    { config: newConfig },
    document_id,
    preview
  )
  return data
}