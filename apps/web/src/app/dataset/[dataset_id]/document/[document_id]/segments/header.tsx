'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2Icon, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PdfImage } from '@/components/upload/component'

import AddOrEdit from './add-edit-segment'

interface IProps {
  name: string
  dataset_id: string
  document_id: string
}

const SegmentHeader = ({ name, dataset_id, document_id }: IProps) => {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const goBack = () => {
    startTransition(() => {
      router.back()
    })
  }

  return (
    <div className="flex justify-between pl-14 pr-8">
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={goBack}
          type="button"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeft size={18} />
          )}
        </Button>
        <PdfImage className="h-6 w-6" />
        <div className="font-2xl font-semibold">{name}</div>
      </div>
      <Button onClick={() => setOpen(true)} type="button">
        <Plus size={16} />
        Add Segment
      </Button>
      <AddOrEdit
        content=""
        open={open}
        setOpen={setOpen}
        document_id={document_id}
        dataset_id={dataset_id}
      />
    </div>
  )
}

export default SegmentHeader
