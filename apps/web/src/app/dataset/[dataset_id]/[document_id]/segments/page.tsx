import { getDataInfo } from '@/db/datasets/documents/action'
import { getSegments } from '@/db/datasets/segment/actions'

import SegmentHeader from './header'
import SegmentPage from './view-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
}

const preload = [
  {
    content: `The pursuit of wealth should be motivated by a desire for financial
    security, not a longing for status or a luxurious lifestyle. If you
    start young and develop the right financial habits, a seven-digit net
    worth is an attainable goal. In his work with wealthy clients, Jason
    Flurry, CFP, founder and president of Legacy Partners Financial Group in
    Woodstock, Georgia, has found that those he calls “true millionaires,”
    people who gain wealth and keep it, see the role of money in their lives
    very differently than those who focus on what money can buy.`,
    segment_id: '1',
  },
  {
    segment_id: '2',
    content: `The pursuit of wealth should be motivated by a desire for financial
    security, not a longing for status or a luxurious lifestyle. If you
    start young and develop the right financial habits, a seven-digit net
    worth is an attainable goal. In his work with wealthy clients, Jason
    Flurry, CFP, founder and president of Legacy Partners Financial Group in
    Woodstock, Georgia, has found that those he calls “true millionaires,”
    people who gain wealth and keep it, see the role of money in their lives
    very differently than those who focus on what money can buy.`,
  },
]

const Page = async ({ params }: IProps) => {
  const { dataset_id, document_id } = params
  const { data } = await getDataInfo(dataset_id, document_id)
  const name = data?.name
  // const preload = await getSegments(dataset_id, document_id)
  return (
    <div className="py-[68px] pl-14 pr-8">
      <SegmentHeader
        name={name}
        document_id={document_id}
        dataset_id={dataset_id}
      />

      <SegmentPage
        preload={preload}
        dataset_id={dataset_id}
        document_id={document_id}
      />
    </div>
  )
}

export default Page
