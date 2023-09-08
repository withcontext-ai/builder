'use client'

import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PdfImage } from '@/components/upload/component'

import AddOrEdit from './add-edit-segment'

const SegmentHeader = () => {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex justify-between">
      <div className="mb-6 flex items-center gap-2">
        <Button size="icon" variant="outline" className="h-8 w-8 p-0">
          <ArrowLeft size={18} />
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
