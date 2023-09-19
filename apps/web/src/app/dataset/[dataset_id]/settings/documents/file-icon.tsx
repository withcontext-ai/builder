import { cn, getAvatarBgColor, getFirstLetter } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PdfImage } from '@/components/upload/component'

import { DataProps } from './utils'

interface IProps {
  data: DataProps
  className?: string
}

const FileIcon = ({ data, className }: IProps) => {
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
      {data?.name}
    </div>
  )
}

export default FileIcon
