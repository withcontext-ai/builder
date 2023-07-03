import Link from 'next/link'

import { cn, getAvatarBgColor } from '@/lib/utils'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface IProps {
  id: string
  title: string
  description: string
  icon: string
}

export default function AppCard({ id, title, description, icon }: IProps) {
  const color = getAvatarBgColor(id || '')

  return (
    <Link href={`/app/${id}`}>
      <Card className="relative h-full hover:shadow-md">
        <div className="absolute top-20 h-px w-full bg-slate-200" />
        <CardHeader className="p-4">
          {icon ? (
            <img
              src={icon}
              alt={id}
              className="relative h-24 w-24 rounded-lg"
            />
          ) : (
            <div
              className={cn('relative h-24 w-24 rounded-lg', `bg-${color}-600`)}
            />
          )}
          <CardTitle className="truncate text-xl">{title}</CardTitle>
          <CardDescription className="line-clamp-4 text-xs">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
