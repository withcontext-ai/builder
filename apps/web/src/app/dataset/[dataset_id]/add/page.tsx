import { redirect, useParams } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getDataset } from '@/db/datasets/actions'

import SettingPage from '../[document_id]/setting-page'

const defaultValues = {
  dataConfig: {
    loaderType: 'pdf',
    splitType: 'character',
    files: [],
    notedData: [],
    chunkSize: 1000,
    chunkOverlap: 0,
  },
}

interface IProps {
  params: { dataset_id: string }
}
const DatasetEdit = async ({ params }: IProps) => {
  const { dataset_id } = params
  const { userId } = auth()
  const datasetDetail = await getDataset(dataset_id)

  if (datasetDetail.created_by !== userId) {
    redirect('/')
  }

  return (
    <div className="h-full overflow-auto">
      <div className="w-[600px]">
        {/* Desktop version, can edit */}
        <SettingPage
          defaultValues={defaultValues}
          datasetId={dataset_id}
          document_id={''}
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
export default DatasetEdit
