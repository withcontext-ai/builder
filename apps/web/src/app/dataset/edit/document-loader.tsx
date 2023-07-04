import { RefObject } from 'react'
import { UseFormReturn } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface IProps {
  ref?: RefObject<HTMLElement>
  form: UseFormReturn<
    {
      name: string
    },
    any,
    undefined
  >
}
const DocumentLoader = ({ ref, form }: IProps) => {
  return (
    <section id="loaders" className="w-full" ref={ref}>
      <div className="mb-6 text-2xl font-semibold leading-8">
        Document Loaders
      </div>
      <div className="mb-6	text-sm font-normal leading-6 text-slate-600">
        Use document loaders to load data from a source as Document&apos;s. A
        Document is a piece of text and associated metadata. For example, there
        are document loaders for loading a simple .txt file, for loading the
        text contents of any web page, or even for loading a transcript of a
        YouTube video.
      </div>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex">
              Type <div className="text-red-500">*</div>
            </FormLabel>
            <FormControl>
              <Input placeholder="Input your dataset name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  )
}

export default DocumentLoader
