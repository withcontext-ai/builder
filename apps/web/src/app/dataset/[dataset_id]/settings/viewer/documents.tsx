import { AnyARecord } from 'dns'
import { useCallback, useMemo, useState } from 'react'
import { throttle } from 'lodash'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

import FileIcon from '../documents/file-icon'
import { formateDate, formateNumber, formateStatus } from '../documents/utils'

const Documents = ({ documents }: { documents: any[] }) => {
  const [data, setData] = useState<any[]>(documents)
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newData =
        documents?.filter(
          (item: any) => item?.name?.includes(e?.target?.value || '')
        ) || []
      setData(newData)
    },
    [documents]
  )
  const throttledOnChange = useMemo(() => throttle(onChange, 500), [onChange])
  return (
    <div className="space-y-4">
      <Input placeholder="Search" onChange={throttledOnChange} />
      {documents?.length === 0 ? (
        <div className="pt-[88px]">
          <div>There is no data yet. </div>
          <div>
            You can upload data from different channels, such as PDF files,
            Notion documents, and so on.
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.map((item: any, index) => {
            const { text, color } = formateStatus(item?.status)

            return (
              <div
                key={index}
                className="rounded-lg border border-slate-100 p-4"
              >
                <FileIcon data={item} />
                <div className="text-sm text-slate-500">
                  Uploaded Time: {formateDate(new Date(item.update_at))}
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  {formateNumber(item?.characters || 0)} characters
                  <div className={cn(color)}>{text}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Documents
