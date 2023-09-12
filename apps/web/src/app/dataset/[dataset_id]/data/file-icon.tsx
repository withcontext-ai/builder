import { cn, getAvatarBgColor, getFirstLetter } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { PdfImage } from '@/components/upload/component'

import { DataProps } from './utils'

interface IProps {
  data: DataProps
}

const FileIcon = ({ data }: IProps) => {
  const isPdf = data?.type === 'pdf'
  const color = getAvatarBgColor(data?.uid || '')

  return (
    <div className="flex items-center gap-1">
      {isPdf ? (
        <PdfImage className="h-4 w-4" />
      ) : (
        <Avatar
          className={cn(
            'relative h-4 w-4',
            data?.icon ? 'bg-white' : `bg-${color}-600`
          )}
        >
          <AvatarFallback className="bg-transparent text-white">
            {getFirstLetter(data?.name || '')}
          </AvatarFallback>
        </Avatar>
      )}
      {data?.name}
    </div>
  )
}

export default FileIcon
