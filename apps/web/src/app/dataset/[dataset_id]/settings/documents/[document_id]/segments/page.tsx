import { getDocumentDetail } from '@/db/documents/action'

import SegmentPage from './view-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
}

const Page = async ({ params }: IProps) => {
  const { dataset_id, document_id } = params
  const data = await getDocumentDetail(document_id)
  const { name, type } = data
  return <SegmentPage dataset_id={dataset_id} name={name} type={type} />
}

export default Page
