import { cn, getAvatarBgColor, getFirstLetter } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PdfImage } from '@/components/upload/component'
import { DataProps } from '@/app/dataset/type'

interface IProps {
  data: DataProps
  className?: string
  isSegment?: boolean
}

const FileIcon = ({ data, className, isSegment }: IProps) => {
  const isPdf = data?.type === 'pdf'
  const color = getAvatarBgColor(data?.short_id || '')

  return (
    <div className="flex items-center gap-1">
      {isPdf ? (
        <PdfImage className={cn('h-4 w-4', className)} />
      ) : (
        <Avatar
          className={cn(
            'relative h-4 w-4',
            data?.icon ? 'bg-white' : `bg-${color}-600`,
            className
          )}
        >
          <AvatarFallback className="break-words bg-transparent text-white">
            {getFirstLetter(data?.name || '')}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(isSegment && 'text-lg font-semibold')}>
        {data?.name}
      </div>
    </div>
  )
}

export default FileIcon
