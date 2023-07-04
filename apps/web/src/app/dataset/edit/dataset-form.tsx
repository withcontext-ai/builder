import { useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { SectionType } from './page'

interface IProps {
  selected?: string
  setSelected?: (s: string) => void
  sections?: SectionType[]
}
const thresholdArray = () => {
  const threshold = []
  for (let i = 0; i <= 1; i += 0.01) threshold.push(i)
  return threshold
}

const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .max(50, { message: 'Dataset name must be less than 50 characters.' }),
  type: z.string().trim(),
})

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: thresholdArray() || 0.7,
}

const DatasetForm = ({ setSelected, sections }: IProps) => {
  const observerRef = useRef<IntersectionObserver>()
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
    sections?.map(
      (item) =>
        item?.ref?.current && observerRef.current?.observe(item?.ref?.current)
    )
  }, [sections])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data, '---data')
  }
  return (
    <div className="relative h-full w-full overscroll-y-auto px-6 pt-18	">
      <div className="max-w-[600px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-9"
          >
            <section id="dataset-name">
              <div className="mb-6 text-2xl font-semibold leading-8">
                DataSet Name
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
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
            <DocumentLoader ref={sections?.[1]?.ref} form={form} />
            <section
              id="splitters"
              className="h-[400px]"
              ref={sections?.[1]?.ref}
            >
              <h1>splitters</h1>
            </section>
            <section id="models" className="h-[400px]" ref={sections?.[2]?.ref}>
              <h1>models</h1>
            </section>
            <section id="stores" className="h-[400px]" ref={sections?.[3]?.ref}>
              <h1>stores</h1>
            </section>
            <section
              id="retrievers"
              className="h-[400px]"
              ref={sections?.[4]?.ref}
            >
              <h1>retrievers</h1>
            </section>
          </form>
        </Form>
      </div>
      <div className="fixed bottom-6 flex w-[600px] justify-end gap-2 rounded-lg border bg-white px-4	py-2">
        <Button variant="outline">Submit</Button>
        <Button type="submit">Submit</Button>
      </div>
    </div>
  )
}
export default DatasetForm
