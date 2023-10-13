import { cn, getAvatarBgColor, getFirstLetter } from '@/lib/utils'
import { NewDocument } from '@/db/documents/schema'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PdfImage } from '@/components/upload/component'

interface IProps {
  data: Partial<NewDocument>
  className?: string
  isSegment?: boolean
}

const FileIcon = ({ data, className, isSegment }: IProps) => {
  const isNotedData = data?.type === 'annotated_data'
  const color = getAvatarBgColor(data?.app_id || '')
  return (
    <div className="flex items-center gap-1">
      {!isNotedData ? (
        <PdfImage className={cn('h-4 w-4', className)} />
      ) : (
        <Avatar
          className={cn(
            'relative flex h-4 w-4 items-center justify-center',
            data?.icon ? `bg-white` : `bg-${color}-600`,
            className
          )}
        >
          {data?.icon ? (
            <img
              src={data?.icon}
              className="h-4 w-4"
              alt="annotatedData icon"
            />
          ) : (
            <AvatarFallback className="break-words bg-transparent text-white">
              {getFirstLetter(data?.name || '')}
            </AvatarFallback>
          )}
        </Avatar>
      )}
      <div className={cn(isSegment && 'text-lg font-semibold')}>
        {data?.name}
      </div>
    </div>
  )
}

export default FileIcon
