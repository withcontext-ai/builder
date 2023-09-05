import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getDataset } from '@/db/datasets/actions'

import BasicsForm from './basic-form'

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
  const { config = {}, name = '' } = datasetDetail
  return (
    <div className="h-full overflow-auto">
      <div className="mx-10 mb-10 mt-18 w-[530px] px-4">
        {/* Desktop version, can edit */}
        <BasicsForm config={config} datasetId={dataset_id} name={name} />

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
