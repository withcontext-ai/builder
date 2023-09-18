import { getDataset } from '@/db/datasets/actions'
import { getDocuments } from '@/db/datasets/documents/action'

import ViewPage from '../viewer/view-page'
import DataPage from './data-page'

interface IProps {
  params: { dataset_id: string }
}

const Page = async ({ params }: IProps) => {
  const { dataset_id } = params
  const preload = await getDocuments({ dataset_id })

  const datasetDetail = await getDataset(dataset_id)

  const { config = {}, name = '' } = datasetDetail
  return (
    <div>
      <DataPage dataset_id={dataset_id} preload={preload?.documents} />
      <ViewPage config={config} name={name} />
    </div>
  )
}
export default Page
