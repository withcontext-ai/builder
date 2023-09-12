import { FileType2 } from 'lucide-react'

interface IProps {
  index: number
  content: string
}
export const PreviewCard = ({ content, index }: IProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-1 flex justify-between text-sm text-slate-500">
        {`#00${index}`}
        <div className="flex gap-2">
          <FileType2 size={18} /> {content?.length} characters
        </div>
      </div>
      <div className="line-clamp-6 text-sm">{content}</div>
    </div>
  )
}
const mockData = [
  {
    segment_id: '01',
    content: `The pursuit of wealth should be motivated by a desire for financial
    security, not a longing for status or a luxurious lifestyle. If you
    start young and develop the right financial habits, a seven-digit net
    worth is an attainable goal. In his work with wealthy clients, Jason
    Flurry, CFP, founder and president of Legacy Partners Financial Group in
    Woodstock, Georgia, has found that those he calls “true millionaires,”
    people who gain wealth and keep it, see the role of money in their lives
    very differently than those who focus on what money can buy.`,
  },
  {
    segment_id: '02',

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

const Preview = () => {
  return (
    <div className="mb-8 flex grid-cols-2 gap-4">
      {mockData?.map((item, index) => {
        return (
          <div key={index}>
            <PreviewCard index={index} content={item?.content} />
          </div>
        )
      })}
    </div>
  )
}

export default Preview
