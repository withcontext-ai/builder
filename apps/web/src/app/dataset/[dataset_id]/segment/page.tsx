import { ArrowLeft, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PdfImage } from '@/components/upload/component'

import AddOrEdit from './add-edit-segment'
import SegmentHeader from './header'
import SegmentPage from './view-page'

interface IProps {
  params: { dataset_id: string; document_id: string }
}

const preload = [
  {
    characters: 2356,
    text: `The pursuit of wealth should be motivated by a desire for financial
    security, not a longing for status or a luxurious lifestyle. If you
    start young and develop the right financial habits, a seven-digit net
    worth is an attainable goal. In his work with wealthy clients, Jason
    Flurry, CFP, founder and president of Legacy Partners Financial Group in
    Woodstock, Georgia, has found that those he calls “true millionaires,”
    people who gain wealth and keep it, see the role of money in their lives
    very differently than those who focus on what money can buy.`,
  },
  {
    characters: 2356,
    text: `The pursuit of wealth should be motivated by a desire for financial
    security, not a longing for status or a luxurious lifestyle. If you
    start young and develop the right financial habits, a seven-digit net
    worth is an attainable goal. In his work with wealthy clients, Jason
    Flurry, CFP, founder and president of Legacy Partners Financial Group in
    Woodstock, Georgia, has found that those he calls “true millionaires,”
    people who gain wealth and keep it, see the role of money in their lives
    very differently than those who focus on what money can buy.`,
  },
]

const Page = () => {
  return (
    <div className="py-[68px] pl-14 pr-8">
      <SegmentHeader />

      <SegmentPage preload={preload} />
    </div>
  )
}

export default Page
