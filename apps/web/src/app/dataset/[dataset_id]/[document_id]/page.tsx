import { getDataInfo, getDocuments, getNotedData } from '@/db/datasets/actions'

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
    (item: any) => item?.type === 'annotated data'
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
      <div className="w-[600px]">
        {/* Desktop version, can edit */}
        <SettingPage
          defaultValues={defaultValues}
          datasetId={dataset_id}
          document_id={document_id}
          apps={apps}
          documents={documents?.documents}
        />

        {/* Mobile version, view only */}
        {/* <DatasetViewer
        name={datasetDetail?.name}
        config={datasetDetail?.config || {}}
      /> */}
      </div>
    </div>
  )
}
