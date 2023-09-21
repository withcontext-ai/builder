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
<<<<<<< Updated upstream
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
=======
  const files = data?.files?.filter((item: any) => item?.type === 'pdf')
  const notedData = data?.files?.filter(
    (item: any) => item?.type === 'annotated data'
  )

  const detail = (await getDocumentDetail(document_id)) || []
  // @ts-ignore
  const type = detail?.type || 'pdf'
  const isPdf = type === 'pdf'
  const current = pick(detail, ['type', 'url', 'name', 'icon', 'uid'])
  const defaultValues = {
    // @ts-ignore
    splitConfig: detail?.config?.splitConfig,
    loaderType: type,
    files: isPdf ? [current] : [],
    notedData: !isPdf ? [current] : [],
  }

  console.log(detail, '----document_id', document_id, defaultValues)
>>>>>>> Stashed changes
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
