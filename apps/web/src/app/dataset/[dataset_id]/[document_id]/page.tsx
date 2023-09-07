import { getDataInfo } from '@/db/datasets/actions'

import SettingPage from './setting-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
  defaultValues: any
}
const Page = async ({ params }: IProps) => {
  const { dataset_id, document_id } = params

  const { data } = await getDataInfo(dataset_id, document_id)
  const defaultValues = { dataConfig: { ...data?.config, files: data?.files } }
  return (
    <div className="h-full overflow-auto">
      <div className="w-[600px]">
        {/* Desktop version, can edit */}
        <SettingPage
          defaultValues={defaultValues}
          datasetId={dataset_id}
          document_id={document_id}
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

export default Page
