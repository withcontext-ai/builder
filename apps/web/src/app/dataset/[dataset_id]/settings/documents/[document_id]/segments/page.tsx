import { getDataInfo } from '@/db/datasets/documents/action'

import SegmentPage from './view-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
}

const Page = async ({ params }: IProps) => {
  const { dataset_id, document_id } = params
  const { data } = await getDataInfo(dataset_id, document_id)

  const name = data?.name
  return (
    <SegmentPage
      dataset_id={dataset_id}
      document_id={document_id}
      name={name}
      type={data?.type}
    />
  )
}

export default Page
