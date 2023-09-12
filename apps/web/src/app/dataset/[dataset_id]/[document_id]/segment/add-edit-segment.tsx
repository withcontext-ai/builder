'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileType2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

import { fetcher } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

interface IProps {
  content?: string
  segment_id?: string
  dataset_id?: string
  document_id?: string
  open?: boolean
  setOpen?: (s: boolean) => void
}

const formSchema = z.object({
  segment: z.string(),
})

const SegmentForm = ({ content }: IProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      segment: content,
    },
  })
  return (
    <div>
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="segment"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="whitespace-pre-line "
                    placeholder="please input segment"
                    {...field}
                    minRows={4}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}

function addSegment(
  url: string,
  { arg }: { arg: { dataset_id: string; uid: string; content: string } }
) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

function editSegment(
  url: string,
  {
    arg,
  }: {
    arg: {
      dataset_id: string
      uid: string
      segment_id: string
      content: string
    }
  }
) {
  return fetcher(url, {
    method: 'PATCH',
    body: JSON.stringify(arg),
  })
}

const AddOrEdit = ({
  content = '',
  open,
  setOpen,
  dataset_id = '',
  document_id = '',
  segment_id = '',
}: IProps) => {
  const { trigger: addTrigger, isMutating } = useSWRMutation(
    `/api/datasets/segment`,
    addSegment
  )

  const { trigger: editTrigger, isMutating: editMutating } = useSWRMutation(
    `/api/datasets/segment`,
    editSegment
  )
  const handelSave = async () => {
    if (!segment_id) {
      await addTrigger({ dataset_id, uid: document_id, content })
    } else {
      await editTrigger({ dataset_id, segment_id, uid: document_id, content })
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {content ? 'Edit' : 'Add'} Segment
          </AlertDialogTitle>
          <AlertDialogDescription>
            <SegmentForm content={content || ''} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 text-sm text-slate-500">
            <FileType2 size={18} /> {content?.length} characters
          </div>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Save</AlertDialogAction>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
export default AddOrEdit
