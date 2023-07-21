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
        <CardHeader className="h-full p-0">
          <CardTitle className="flex flex-1 gap-4 text-lg">
            <PdfImage />
            <div className="line-clamp-2 max-h-[52px] flex-1">{title}</div>
          </CardTitle>
          <CardFooter className="flex h-5 w-full gap-3 p-0">
            <div className="flex text-xs font-medium	text-slate-500">
              <Files size={18} color="#64748B" />2 docs
            </div>
            <div className="flex text-xs font-medium	text-slate-500">
              <FileType2 size={18} color="#64748B" />
              2.8k words
            </div>
            <div className="flex text-xs font-medium	text-slate-500">
              <FileOutput size={18} color="#64748B" />2 linked apps
            </div>
          </CardFooter>
        </CardHeader>
      </Card>
    </Link>
  )
}
