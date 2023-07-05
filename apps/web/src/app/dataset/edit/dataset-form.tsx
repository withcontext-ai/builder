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
import Retrievers from './retrievers'
import TextEmbedding from './text-embedding'
import TextSplits from './text-spliter'
import VectorStores from './vector-stores'

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
  loaderType: z.string(),
  splitType: z.string(),
  embeddingTyp: z.string(),
  files: z.array(z.string()).optional(),
  chunkSize: z.number(),
  chunkOverlap: z.number(),
  storeType: z.string(),
  collectionName: z.string().optional(),
  chromaUrl: z.string().optional(),
  apiKey: z.string().optional(),
  instanceName: z.string().optional(),
  developmentName: z.string().optional(),
  apiVersion: z.string().optional(),
  retrieversType: z.string(),
  promptName: z.string().optional(),
  promptDesc: z.string().optional(),
  promptMsg: z.string().optional(),
})

const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: thresholdArray() || 0.7,
}

const DatasetForm = ({ setSelected, sections }: IProps) => {
  const observerRef = useRef<IntersectionObserver>()

  const nameRef = useRef<HTMLElement>(null)
  const defaultValues = {
    name: '',
    loaderType: 'pdf loader',
    splitType: 'character textsplitter',
    files: [],
    chunkSize: 1000,
    chunkOverlap: 1000,
    embeddingType: 'openAI embedding',
    storeType: 'pinecone',
    collectionName: '',
    chromaUrl: '',
    apiKey: '',
    instanceName: '',
    developmentName: '',
    apiVersion: '',
    retrieversType: 'vectorStoreRetriever',
    promptName: '',
    promptDesc: '',
    promptMsg: '',
  }

  const handelCancle = () => {
    console.log('---cancel')
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
    sections?.map(
      (item) =>
        item?.ref?.current && observerRef.current?.observe(item?.ref?.current)
    )
  }, [sections])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data, '---data')
  }
  console.log(form, '----form')
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
            <DocumentLoader form={form} />
            <TextSplits form={form} />
            <TextEmbedding form={form} />
            <VectorStores form={form} />
            <Retrievers form={form} />
          </form>
        </Form>
      </div>
      <div className="fixed bottom-6 flex w-[600px] justify-end gap-2 rounded-lg border bg-white px-4	py-2">
        <Button type="reset" onClick={handelCancle} variant="outline">
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </div>
  )
}
export default DatasetForm
