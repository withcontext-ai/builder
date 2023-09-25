import { NextRequest, NextResponse } from 'next/server'
import { omit, pick } from 'lodash'

import { getDataSplitPreview } from '@/db/datasets/documents/action'
import { getSegments } from '@/db/datasets/segment/actions'
import { DataProps } from '@/app/dataset/type'

// get document split preview
export async function POST(req: NextRequest) {
  const { dataset_id, dataConfig, document_id, preview } = await req.json()
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
  }
  const currentConfig = pick(dataConfig, [
    'splitType',
    'chunkSize',
    'chunkOverlap',
    'loaderTye',
  ])
  files = files?.reduce((m: DataProps[], item: DataProps) => {
    const cur = Object.assign(item, currentConfig)
    m?.push(cur)
    return m
  }, [])

  const newConfig = { ...currentConfig, files }
  const uid = !isAdd ? document_id : files?.[0]?.uid
  await getDataSplitPreview(dataset_id, { config: newConfig }, uid, preview)
  const { data } = await getSegments(dataset_id, uid)
  const segments = data?.segments
  return NextResponse.json({
    success: true,
    data:
      segments?.length !== 0 ? segments : [{ content: '', segment_id: '01' }],
  })
}
