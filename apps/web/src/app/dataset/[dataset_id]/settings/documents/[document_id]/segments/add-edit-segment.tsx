'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import SegmentForm from './segment-form'

interface IProps {
  content?: string
  segment_id?: string
  dataset_id?: string
  document_id?: string
  open?: boolean
  setOpen?: (s: boolean) => void
  handelConfirm?: (s: void) => void
}

const AddOrEdit = (props: IProps) => {
  return (
    <AlertDialog open={props?.open} onOpenChange={props?.setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {props?.content ? 'Edit' : 'Add'} Segment
          </AlertDialogTitle>
        </AlertDialogHeader>
        <SegmentForm {...props} />
      </AlertDialogContent>
    </AlertDialog>
  )
}
export default AddOrEdit
