import { RefObject, useCallback, useEffect, useRef } from 'react'
import { find, maxBy, sortBy, throttle } from 'lodash'
import { UseFormReturn } from 'react-hook-form'
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
import { FormSchema } from './page'
import TextSplits from './splitter'
import TextEmbedding from './text-embedding'
import VectorStores from './vector-stores'

interface IProps {
  selected?: string
  setSelected: (s: string) => void
  error: string
  setError: (s: string) => void
  setSaved: (s: boolean) => void
  form: UseFormReturn<any>
}

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
}

const DatasetForm = ({
  error,
  setError,
  setSaved,
  form,
  setSelected,
}: IProps) => {
  const observerRef = useRef<IntersectionObserver>()
  const sectionsRef = useRef<RefObject<HTMLElement>[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLElement>(null)

  const handelCancel = () => {
    setError('')
    form.reset()
  }

  function observerCallback(entries: [], _observer: any) {
    const len = entries?.length - 1
    const all = sortBy(entries, ['intersectionRatio'])
    let current = { target: { id: '' } }
    if (all[len - 1]?.boundingClientRect?.top <= 0) {
      current = all[len - 1]
    } else {
      current = all[len]
    }
    const target = current?.target
    console.log('all', all, target)
    setSelected(target?.id)
  }

  useEffect(() => {
    scrollRef?.current?.addEventListener('scroll', function () {
      observerRef.current = new IntersectionObserver(
        // @ts-ignore
        observerCallback,
        observerOptions
      )
      sectionsRef?.current?.map(
        (item) => item?.current && observerRef.current?.observe(item?.current)
      )
    })
  }, [sectionsRef, scrollRef, observerCallback])

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setSaved(true)
    setError('')
    console.log('data', '---data')
  }
  return (
    <div
      className="relative h-full w-full overflow-auto px-6 pb-[100px] pt-12"
      ref={scrollRef}
    >
      <div className="sm:w-full md:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <section
              id="dataset-name"
              ref={nameRef}
              className="border-b-[1px] py-6"
            >
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
