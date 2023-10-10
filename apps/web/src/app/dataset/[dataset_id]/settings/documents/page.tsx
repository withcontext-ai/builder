import { getDataset } from '@/db/datasets/actions'
import { getDatasetDocument, getDocumentByTable } from '@/db/documents/action'
import { NewDocument } from '@/db/documents/schema'

import ViewPage from '../viewer/view-page'
import DataPage from './data-page'

interface IProps {
  params: { dataset_id: string }
}

const Page = async ({ params }: IProps) => {
  const { dataset_id } = params
  const datasetDetail = await getDataset(dataset_id)
  const data: NewDocument[] = await getDocumentByTable({
    dataset_id,
    params: { search: '', pageIndex: 0, pageSize: 10 },
  })
  const { config = {}, name = '' } = datasetDetail
  const files = await getDatasetDocument(dataset_id)
  return (
    <div className="h-full overflow-hidden">
      <DataPage datasetId={dataset_id} preload={data} />
      <ViewPage config={config} name={name} files={files} />
    </div>
  )
}

export default Page
