'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

import { cn, fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FileProps } from '@/components/upload/utils'

import DocumentLoader, {
  stringUrlToFile,
} from '../add-edit-data/document-loader'
import { FormSchema, SchemaProps } from '../data/utils'
import Preview from './preview'
import TextSplits from './splitter'

export interface FormProps {
  datasetId?: string
  config?: any
  active: number
  setActive: (s: number) => void
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

const DataForm = ({ datasetId, config, active, setActive }: FormProps) => {
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

  const [data, setData] = useState<FileProps[]>(uploadFiles)
  const [values, setValues] = useState<SchemaProps>(config)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: values,
  })

  const { handleSubmit, watch } = form
  const { trigger } = useSWRMutation(`/api/datasets/${datasetId}`, editDataset)
  const router = useRouter()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSubmit = async (data: SchemaProps) => {
    try {
      const { name, ...rest } = data
      const json = await trigger({ name, config: rest })
      setValues({ name: json.body?.name, ...json?.body?.config })
      router.refresh()
    } catch (error) {}
  }

  const handleClick = () => {
    if (active < 3) {
      setActive(active + 1)
    } else {
      handleSubmit(onSubmit)()
    }
  }

  return (
    <div className={cn('h-full w-full')}>
      <div
        className={cn(
          'sm:w-full md:max-w-[600px]',
          active === 3 && 'md:max-w-[740px]'
        )}
      >
        <Form {...form}>
          <form className="w-full">
            {active === 1 && (
              <DocumentLoader form={form} data={data} setData={setData} />
            )}
            {active === 2 && <TextSplits form={form} />}
            {active === 3 && <Preview />}
          </form>
        </Form>
        <div
          className={cn('flex justify-between', active == 1 && 'justify-end')}
        >
          {active !== 1 && (
            <Button variant="outline" onClick={() => setActive(active - 1)}>
              Previous
            </Button>
          )}
          <div className="flex  gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dataset/${datasetId}/data`)}
            >
              Cancel
            </Button>
            <Button onClick={handleClick}>
              {active !== 3 ? 'Next' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default DataForm
