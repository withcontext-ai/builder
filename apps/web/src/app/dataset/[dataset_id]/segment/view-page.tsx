'use client'

import { useRef, useState } from 'react'
import { Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { PreviewCard } from '../[document_id]/preview'
import AddOrEdit from './add-edit-segment'

interface IProps {
  preload: any
}

const SegmentPage = ({ preload }: IProps) => {
  const [open, setOpen] = useState(false)
  const current = useRef({ text: '', characters: 0 })
  return (
    <div className="mb-8 flex grid-cols-2 gap-4">
      {preload?.map((item: any, index: number) => {
        return (
          <div
            key={index}
            className="group/card relative cursor-pointer"
            onClick={(e) => {
              setOpen(true)
              e.preventDefault()
              // @ts-ignore
              current.current = item
            }}
          >
            <PreviewCard
              characters={item?.characters}
              index={index}
              text={item?.text}
            />
            <Button
              type="button"
              className="invisible absolute bottom-4 right-4 flex h-8 w-8 gap-2 text-red-600 group-hover/card:visible"
              size="icon"
              variant="outline"
            >
              <Trash size={18} />
            </Button>
          </div>
        )
      })}
      <AddOrEdit
        text={current?.current?.text}
        characters={current?.current?.characters}
        open={open}
        setOpen={setOpen}
      />
    </div>
  )
}

export default SegmentPage
