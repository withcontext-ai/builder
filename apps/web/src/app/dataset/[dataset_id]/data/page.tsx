import { getDocuments } from '@/db/datasets/documents/action'

import DataPage from './data-page'

interface IProps {
  params: { dataset_id: string }
}

const Page = async ({ params }: IProps) => {
  const { dataset_id } = params
  const preload = await getDocuments({ dataset_id })
  return <DataPage dataset_id={dataset_id} preload={preload?.documents} />
}
export default Page
