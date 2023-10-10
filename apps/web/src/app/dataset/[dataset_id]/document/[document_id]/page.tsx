import { getDocumentDetail, getNotedData } from '@/db/documents/action'

import SettingPage from './setting-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
}
export default async function Page({ params }: IProps) {
  const { dataset_id, document_id } = params
  const { data: apps = [] } = await getNotedData()

  const detail = await getDocumentDetail(document_id)
  const isPdf = detail?.type === 'pdf'
  const config = detail?.config
  const defaultValues = {
    ...config?.splitConfig,
    loaderType: detail?.type,
    files: isPdf ? [detail] : [],
    notedData: !isPdf ? [detail] : [],
  }

  return (
    <div className="h-full w-full overflow-auto">
      <SettingPage
        defaultValues={defaultValues}
        datasetId={dataset_id}
        documentId={document_id}
        apps={apps}
        uid={detail?.uid}
      />
    </div>
  )
}
