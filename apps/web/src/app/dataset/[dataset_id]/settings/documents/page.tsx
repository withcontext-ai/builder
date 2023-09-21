import { getDataset } from '@/db/datasets/actions'
import { getDocuments } from '@/db/datasets/documents/action'
import { getDocumentByTable } from '@/db/documents/action'
import { DataProps } from '@/app/dataset/type'

import ViewPage from '../viewer/view-page'
import DataPage from './data-page'

interface IProps {
  params: { dataset_id: string }
}

const Page = async ({ params }: IProps) => {
  const { dataset_id } = params
  const preload = await getDocuments({ dataset_id })
  const datasetDetail = await getDataset(dataset_id)
  const data: DataProps[] = await getDocumentByTable({
    dataset_id,
    params: { search: '', pageIndex: 0, pageSize: 10 },
  })
  console.log(data, '---data')
  const { config = {}, name = '' } = datasetDetail
  return (
    <div className="h-full overflow-hidden">
      <DataPage dataset_id={dataset_id} preload={data} />
      <ViewPage config={config} name={name} />
    </div>
  )
}
export default Page
