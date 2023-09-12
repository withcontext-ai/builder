import { cn, getAvatarBgColor, getFirstLetter } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { NotedDataProps } from '../../type'

interface IProps {
  data: NotedDataProps
  isAdd?: boolean
}

const NotedDataCard = ({ data: item, isAdd = false }: IProps) => {
  const color = getAvatarBgColor(item?.uid || '')

  return (
    <div
      className={cn(
        'flex items-center gap-2 truncate text-sm font-normal text-black',
        !isAdd && 'cursor-pointer'
      )}
    >
      <Avatar
        className={cn(
          'relative h-8 w-8',
          item?.icon ? 'bg-white' : `bg-${color}-600`
        )}
      >
        <AvatarFallback className="bg-transparent text-white">
          {getFirstLetter(item?.name)}
        </AvatarFallback>
      </Avatar>
      {item.name}
    </div>
  )
}

export default NotedDataCard
