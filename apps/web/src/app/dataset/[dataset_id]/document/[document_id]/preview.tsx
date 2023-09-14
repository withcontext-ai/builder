import { useState } from 'react'
import { FileType2 } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'

export const PreviewCard = ({ content, index }: segmentProps) => {
  return (
    <div className="h-[182px] rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-1 flex justify-between text-sm text-slate-500">
        {`#00${index}`}
        <div className="flex gap-2">
          <FileType2 size={18} /> {content?.length?.toLocaleString()} characters
        </div>
      </div>
      <div className="line-clamp-6 text-sm">{content}</div>
    </div>
  )
}
export const LoadingCard = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <Skeleton
      key={i}
      className="h-[182px] rounded-lg border border-transparent"
    />
  ))

interface segmentProps {
  content: string
  segment_id?: string
  index?: number
}
interface IProps {
  data: segmentProps[]
  isLoading: boolean
}
const Preview = ({ isLoading, data }: IProps) => {
  return (
    <div className="mb-5 grid h-full w-full grid-cols-2 gap-4">
      {isLoading ? (
        <LoadingCard />
      ) : (
        data?.map((item, index) => {
          return (
            <div key={index}>
              <PreviewCard index={index} content={item?.content} />
            </div>
          )
        })
      )}
    </div>
  )
}

export default Preview
