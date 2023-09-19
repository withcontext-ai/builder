import {
  getDataInfo,
  getDocuments,
  getNotedData,
} from '@/db/datasets/documents/action'

import SettingPage from './setting-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
}
export default async function Page({ params }: IProps) {
  const { dataset_id, document_id } = params
  const { data: apps = [] } = await getNotedData()
  const documents = await getDocuments({ dataset_id })

  const { data } = await getDataInfo(dataset_id, document_id)
  const files = data?.files?.filter((item: any) => item?.type === 'pdf')
  const notedData = data?.files?.filter(
    (item: any) => item?.type === 'annotated_data'
  )
  const defaultValues = {
    dataConfig: {
      ...data?.config,
      files,
      notedData,
    },
  }
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
