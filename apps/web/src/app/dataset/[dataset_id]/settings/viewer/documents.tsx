import { useCallback, useMemo, useState } from 'react'
import { throttle } from 'lodash'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DataProps, DocumentProps } from '@/app/dataset/type'

import FileIcon from '../documents/file-icon'
import { formateDate, formateNumber, formateStatus } from '../documents/utils'

const Documents = ({ documents }: { documents: DataProps[] }) => {
  const [data, setData] = useState<DataProps[]>(documents)
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newData =
        documents?.filter(
          (item: DataProps) => item?.name?.includes(e?.target?.value || '')
        ) || []
      setData(newData)
    },
    [documents]
  )
  const throttledOnChange = useMemo(() => throttle(onChange, 500), [onChange])
  return (
    <div className="flex h-[calc(100%-60px)] flex-col">
      <Input
        placeholder="Search"
        onChange={throttledOnChange}
        className="mx-6 mb-4 flex w-[calc(100%-48px)]"
      />
      {documents?.length === 0 ? (
        <div className="px-6 pt-[88px]">
          <div>There is no data yet. </div>
          <div>
            You can upload data from different channels, such as PDF files,
            Notion documents, and so on.
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-1 flex-col space-y-2 overflow-auto px-6">
          {data?.map((item: DocumentProps, index) => {
            const { text, color } = formateStatus(item?.status)

            return (
              <div
                key={index}
                className="rounded-lg border border-slate-100 p-4"
              >
                <FileIcon data={item} />
                <div className="text-sm text-slate-500">
                  Uploaded Time:
                  {formateDate(item.updated_at)}
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
