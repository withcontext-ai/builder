import { omit, pick } from 'lodash'

import {
  getDataInfo,
  getDocuments,
  getNotedData,
} from '@/db/datasets/documents/action'
import { getDocumentDetail } from '@/db/documents/action'
import { DataProps, NotedDataProps } from '@/app/dataset/type'

import SettingPage from './setting-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
}
export default async function Page({ params }: IProps) {
  const { dataset_id, document_id } = params
  const { data: apps = [] } = await getNotedData()
  const documents = await getDocuments({ dataset_id })

  const { data } = await getDataInfo(dataset_id, document_id)
  const files = data?.files?.filter((item: DataProps) => item?.type === 'pdf')
  const notedData = data?.files?.filter(
    (item: NotedDataProps) => item?.type === 'annotated_data'
  )
  const defaultValues = {
    ...data?.config,
    files,
    notedData,
  }
  const detail = await getDocumentDetail(document_id)
  console.log(detail, '----document_id', document_id)
  return (
    <div className="h-full overflow-auto">
      <div className="w-full">
        <SettingPage
          defaultValues={defaultValues}
          datasetId={dataset_id}
          document_id={document_id}
          apps={apps}
          documents={documents?.documents}
        />
      </div>
    </div>
  )
}
