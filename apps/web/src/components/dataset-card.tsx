import Link from 'next/link'
import { FileOutput, Files, FileType2 } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { PdfImage } from './upload/component'

interface IProps {
  id: string
  title: string
}

export default function DatasetCard({ id, title }: IProps) {
  return (
    <Link href={`/dataset/${id}`}>
      <Card className="flex h-[148px] flex-col p-6 hover:shadow-md">
        <CardHeader>
          <CardTitle className="line-clamp-3 text-lg">{title}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  )
}
