'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { isEqual } from 'lodash'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { useDebounce } from 'usehooks-ts'
import { z } from 'zod'

import { fetcher } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FileProps } from '@/components/upload/utils'

import { stringUrlToFile } from '../add-edit-data/document-loader'
import { FormSchema, SchemaProps } from '../data/utils'
import TextEmbedding from './text-embedding'
import VectorStores from './vector-stores'

export interface FormProps {
  datasetId?: string
  name?: string
  config?: any
  setUploading?: (s: boolean) => void
}

type Params = SchemaProps

function editDataset(
  url: string,
  { arg }: { arg: { name: string; config: Omit<Params, 'name'> } }
) {
  return fetcher(url, {
    method: 'PATCH',
    body: JSON.stringify(arg),
  })
}

const BasicsForm = ({ datasetId, config, name }: FormProps) => {
  const uploadFiles = useMemo(() => {
    const files = config?.files
    return files
      ? files.reduce((m: FileProps[], item: FileProps) => {
          const file = stringUrlToFile(item)
          m?.push(file)
          return m
        }, [])
      : []
  }, [config?.files])

  const defaultValues = useMemo(() => {
    return { name, ...config }
  }, [name, config])
  const [data, setData] = useState<FileProps[]>(uploadFiles)
  const [values, setValues] = useState<SchemaProps>(defaultValues)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values,
  })

  const { handleSubmit, watch } = form
  const { trigger } = useSWRMutation(`/api/datasets/${datasetId}`, editDataset)
  const router = useRouter()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formValue = useMemo(() => watch(), [JSON.stringify(watch())])
  const debouncedFormValue = useDebounce(formValue, 1000)
  const latestFormValueRef = useRef(defaultValues)
  const onSubmit = async (data: SchemaProps) => {
    try {
      const { name, ...rest } = data
      const json = await trigger({ name, config: rest })
      setValues({ name: json.body?.name, ...json?.body?.config })
      latestFormValueRef.current = data
      router.refresh()
    } catch (error) {}
  }

  useEffect(() => {
    if (!isEqual(debouncedFormValue, latestFormValueRef.current)) {
      handleSubmit(onSubmit)()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(debouncedFormValue)])

  return (
    <div className="h-full w-full overflow-auto px-14 pb-[100px] pt-12">
      <div className="sm:w-full md:max-w-[600px]">
        <Form {...form}>
          <form className="w-full">
            <section id="dataset-name" className="border-b-[1px] py-6">
              <div className="mb-6 text-2xl font-semibold leading-8">
                Dataset Name
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-[332px]">
                    <FormLabel className="flex">
                      Dataset Name <div className="text-red-500">*</div>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Input your dataset name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
            <TextEmbedding form={form} />
            <VectorStores form={form} />
          </form>
        </Form>
      </div>
    </div>
  )
}
export default BasicsForm
