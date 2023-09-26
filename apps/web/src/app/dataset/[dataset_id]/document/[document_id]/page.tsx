import { getDataInfo, getNotedData } from '@/db/datasets/documents/action'
import { DataProps, DocumentProps } from '@/app/dataset/type'

import SettingPage from './setting-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
}
export default async function Page({ params }: IProps) {
  const { dataset_id, document_id } = params
  const { data: apps = [] } = await getNotedData()

  const { data } = await getDataInfo(dataset_id, document_id)
  const files = data?.files?.filter((item: DataProps) => item?.type === 'pdf')
  const notedData = data?.files?.filter(
    (item: DocumentProps) => item?.type === 'annotated_data'
  )
  const defaultValues = {
    ...data?.config,
    files,
    notedData,
  }
  return (
    <div className="h-full w-full overflow-auto">
      <SettingPage
        defaultValues={defaultValues}
        datasetId={dataset_id}
        documentId={document_id}
        apps={apps}
      />
    </div>
  )
}
