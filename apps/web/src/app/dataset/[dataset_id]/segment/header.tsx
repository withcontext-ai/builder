'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2Icon, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PdfImage } from '@/components/upload/component'

import AddOrEdit from './add-edit-segment'

const SegmentHeader = () => {
  const [isPending, startTransition] = useTransition()

  const [open, setOpen] = useState(false)
  const router = useRouter()

  const goBack = () => {
    startTransition(() => {
      router.back()
    })
  }
  return (
    <div className="flex justify-between">
      <div className="mb-6 flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={goBack}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowLeft size={18} />
          )}
        </Button>
        <PdfImage className="h-6 w-6" />
        <div className="font-2xl font-semibold">
          How to become a millionaire.pdf
        </div>
      </div>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Add Segment
      </Button>
      <AddOrEdit text="" characters={0} open={open} setOpen={setOpen} />
    </div>
  )
}

export default SegmentHeader
