import { getDataInfo } from '@/db/datasets/documents/action'

import SegmentHeader from './header'
import SegmentPage from './view-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
}

const Page = async ({ params }: IProps) => {
  const { dataset_id, document_id } = params
  const { data } = await getDataInfo(dataset_id, document_id)
  const name = data?.name
  return (
    <div className="h-full py-[68px]">
      <SegmentHeader
        name={name}
        document_id={document_id}
        dataset_id={dataset_id}
      />

      <SegmentPage dataset_id={dataset_id} document_id={document_id} />
    </div>
  )
}

export default Page
