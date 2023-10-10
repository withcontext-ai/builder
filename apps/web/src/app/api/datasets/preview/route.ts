import { NextRequest, NextResponse } from 'next/server'
import { pick } from 'lodash'

import { getDatasetDocument, getDataSplitPreview } from '@/db/documents/action'
import { NewDocument } from '@/db/documents/schema'
import { getSegments } from '@/db/documents/segment/actions'
import { FileProps } from '@/components/upload/utils'
import { DocumentParamsType } from '@/app/dataset/type'

export const maxDuration = 300

export async function createDocumentParams(dataConfig: any) {
  const isPdf = dataConfig?.loaderType === 'pdf'

  const splitConfig = {
    split_type: dataConfig?.splitType || 'character',
    chunk_size: dataConfig?.chunkSize || 500,
    chunk_overlap: dataConfig?.chunkOverlap || 0,
  }
  const currentDocuments = isPdf ? dataConfig?.files : dataConfig?.notedData

  const files = currentDocuments?.reduce(
    (m: DocumentParamsType[], item: FileProps) => {
      const cur = { url: item?.url || '', type: item?.type, uid: item?.uid }
      // @ts-ignore
      m.push({ ...cur, split_option: splitConfig })
      return m
    },
    []
  )
  const config = pick(dataConfig, ['splitType', 'chunkSize', 'chunkOverlap'])
  return { files, splitConfig, config, currentDocuments }
}

// get document split preview
export async function POST(req: NextRequest) {
  const { dataset_id, dataConfig, preview, uid: _uid } = await req.json()
  const { files } = await createDocumentParams(dataConfig)
  if (_uid) {
    files[0].uid = _uid
  }
  const uid = files[0].uid
  await getDataSplitPreview(dataset_id, files, uid, preview)
  const res = await getSegments(dataset_id, uid)
  const data = res?.data
  const segments =
    data?.segments?.length === 0
      ? [{ content: '', segment_id: '00' }]
      : data?.segments
  return NextResponse.json({
    ...res,
    success: true,
    data: { totalItems: data?.totalItems, segments },
  })
}

// get disabled noted data
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams
  const dataset_id = query.get('dataset_id') || ''
  const documents = await getDatasetDocument(dataset_id)
  const data = documents?.filter(
    (item: NewDocument) => item?.type === 'annotated_data'
  )
  return NextResponse.json({
    data,
    success: true,
  })
}
