'use client'

import { useRef } from 'react'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import SearchSelect from './search-select'
import { SessionProps } from './text-spliter'

const types = [
  { label: 'VectorStoreRetriever', value: 'vectorStoreRetriever' },
  { label: 'Comming soon...', value: 'comming soon' },
]

const Retrievers = ({ form, sectionsRef }: SessionProps) => {
  const ref = useRef<HTMLAnchorElement>(null)
  sectionsRef.push(ref)

  return (
    <section id="retrievers" className="w-full]" ref={ref}>
      <div className="mb-6 text-2xl font-semibold leading-8">Retrievers</div>
      <div className="mb-6	text-sm font-normal leading-6 text-slate-600">
        A retriever is an interface that returns documents given an unstructured
        query. It is more general than a vector store. A retriever does not need
        to be able to store documents, only to return (or retrieve) it. Vector
        stores can be used as the backbone of a retriever, but there are other
        types of retrievers as well.
      </div>
      <SearchSelect
        form={form}
        name="retrieversType"
        values={types}
        title="Retrievers"
      />
      <FormField
        control={form.control}
        name="promptName"
        render={({ field }) => (
          <FormItem className="my-6 w-[332px]">
            <FormLabel className="flex">Prompt Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="physics-qa" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="promptDesc"
        render={({ field }) => (
          <FormItem className="my-6">
            <FormLabel className="flex">Prompt Description</FormLabel>
            <FormControl>
              <Textarea
                minRows={3}
                placeholder="Good for answering questions about physics"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="promptMsg"
        render={({ field }) => (
          <FormItem className="my-6">
            <FormLabel className="flex">Prompt System Message</FormLabel>
            <FormControl>
              <Textarea
                minRows={3}
                placeholder="You are a very smart physics professor. You are great at answering questions about physics in a concise and easy to understand manner. When you don’t "
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  )
}
export default Retrievers
