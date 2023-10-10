import { pick } from 'lodash'

import { getDatasetDocument } from '@/db/documents/action'
import { NewDocument } from '@/db/documents/schema'
import { FileProps } from '@/components/upload/utils'
import { DocumentParamsType } from '@/app/dataset/type'

export async function formateDocumentParams(
  dataset_id: string,
  document_id?: string
) {
  const documents = await getDatasetDocument(dataset_id)
  // delete or add  document
  let currentFiles = documents?.filter(
    (item) => item?.short_id !== document_id
  ) as any[]

  const files = currentFiles?.reduce(
    (m: DocumentParamsType[], item: NewDocument) => {
      // @ts-ignore
      let config = item?.config?.splitConfig

      const splitConfig = {
        split_type: config?.splitType,
        chunk_size: config?.chunkSize,
        chunk_overlap: config?.chunkOverlap,
      }
      const cur = {
        url: item?.url || '',
        type: item?.type,
        uid: item?.uid,
      }
      // @ts-ignore
      m.push({ ...cur, split_option: splitConfig })
      return m
    },
    []
  )
  return files
}

export async function createDocumentParams(dataConfig: any) {
  // edit or preview document segment
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
