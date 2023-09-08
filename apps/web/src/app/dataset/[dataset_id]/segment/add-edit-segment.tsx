'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FileType2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

interface IProps {
  text?: string
  characters?: number
}

const formSchema = z.object({
  segment: z.string(),
})

const SegmentForm = ({ text, characters }: IProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      segment: text,
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

const AddOrEdit = ({
  text,
  characters,
  open,
  setOpen,
}: IProps & { open: boolean; setOpen: (s: boolean) => void }) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{text ? 'Edit' : 'Add'} Segment</AlertDialogTitle>
          <AlertDialogDescription>
            <SegmentForm text={text} characters={characters} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 text-sm text-slate-500">
            <FileType2 size={18} /> {characters} characters
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
