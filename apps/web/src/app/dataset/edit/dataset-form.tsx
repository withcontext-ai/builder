import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { defaultAnimateLayoutChanges } from '@dnd-kit/sortable'
import { zodResolver } from '@hookform/resolvers/zod'
import { Y } from 'drizzle-orm/query-promise.d-2e42fbc9'
import { difference, update } from 'lodash'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import DocumentLoader from './document-loader'
import { FormSchema, SectionType } from './page'
import Retrievers from './retrievers'
import TextEmbedding from './text-embedding'
import TextSplits from './text-spliter'
import VectorStores from './vector-stores'

interface IProps {
  selected?: string
  setSelected: (s: string) => void
  error: string
  setError: (s: string) => void
  setSaved: (s: boolean) => void
  form: UseFormReturn<any>
}
const thresholdArray = () => {
  const threshold = []
  for (let i = 0; i <= 1; i += 0.01) threshold.push(i)
  return threshold
}

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: thresholdArray() || 0.7,
}

const DatasetForm = ({ error, setError, setSaved, form }: IProps) => {
  const observerRef = useRef<IntersectionObserver>()
  const sectionsRef = useRef<RefObject<HTMLElement>[]>([])

  const nameRef = useRef<HTMLElement>(null)

  const handelCancel = () => {
    setError('')
    form.reset()
  }

  const listener = () => {
    observerRef.current = new IntersectionObserver(
      observerCallback,
      observerOptions
    )
    // @ts-ignore
    sections?.map((item) => observer.observe(item?.ref?.current))
  }

  function observerCallback(entries: any, observer: any) {
    entries.forEach((entry: any) => {
      if (entry.isIntersecting && entry?.intersectionRatio) {
        // how to chose the active
      }
    })
  }

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      observerCallback,
      observerOptions
    )
    // @ts-ignore
    sectionsRef?.current?.map(
      (item) => item?.current && observerRef.current?.observe(item?.current)
    )
  }, [sectionsRef])

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setSaved(true)
    setError('')
  }
  return (
    <div className="relative h-full w-full overflow-auto px-6 pb-[100px]	pt-18">
      <div className="max-w-[600px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-16"
          >
            <section id="dataset-name" ref={nameRef}>
              <div className="mb-6 text-2xl font-semibold leading-8">
                DataSet Name
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-[332px]">
                    <FormLabel className="flex">
                      DataSet Name <div className="text-red-500">*</div>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Input your dataset name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
            <DocumentLoader form={form} sectionsRef={sectionsRef.current} />
            <TextSplits form={form} sectionsRef={sectionsRef.current} />
            <TextEmbedding form={form} sectionsRef={sectionsRef.current} />
            <VectorStores form={form} sectionsRef={sectionsRef.current} />
            <Retrievers form={form} sectionsRef={sectionsRef.current} />
            <div
              className={cn(
                'fixed bottom-6 flex w-[600px] items-center justify-between rounded-lg border	bg-white px-4 py-2',
                error ? 'bg-red-500 text-slate-100' : ''
              )}
            >
              <div className="max-w-[500px]"> {error}</div>
              <div className="flex justify-end gap-2 ">
                <Button
                  type="reset"
                  onClick={handelCancel}
                  variant="outline"
                  className={cn(error ? 'border-none bg-red-500' : '')}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
export default DatasetForm
