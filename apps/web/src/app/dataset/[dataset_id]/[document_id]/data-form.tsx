'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { CopySlash } from 'lucide-react'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

import { cn, fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FileProps } from '@/components/upload/utils'

import { DataConfigProps, DataSchema, DataSchemeProps } from '../data/utils'
import DocumentLoader, { stringUrlToFile } from './document-loader'
import Preview from './preview'
import TextSplits from './splitter'

export interface FormProps {
  datasetId: string
  documentId: string
  config?: any
  active: number
  setActive: (s: number) => void
  setUploading?: (s: boolean) => void
}

const defaultValues = {
  dataConfig: {
    loaderType: 'pdf',
    splitType: 'character',
    files: [],
    chunkSize: 1000,
    chunkOverlap: 0,
  },
}

type Params = DataSchemeProps

function addData(
  url: string,
  { arg }: { arg: { dataset_id: string; dataConfig: any } }
) {
  console.log(arg, '---args')
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

const DataForm = ({
  datasetId,
  config,
  active,
  setActive,
  documentId,
}: FormProps) => {
  const isAdd = documentId === 'add'
  const uploadFiles = useMemo(() => {
    const files = config?.files
    return files && !isAdd
      ? files.reduce((m: FileProps[], item: FileProps) => {
          const file = stringUrlToFile(item)
          m?.push(file)
          return m
        }, [])
      : []
  }, [config?.files, isAdd])

  const [data, setData] = useState<FileProps[]>(uploadFiles)
  const [values, setValues] = useState<DataSchemeProps>(config)
  const form = useForm<z.infer<typeof DataSchema>>({
    resolver: zodResolver(DataSchema),
    defaultValues: isAdd ? defaultValues : values,
  })

  const { handleSubmit, watch } = form

  const { trigger } = useSWRMutation(`/api/datasets/document`, addData)
  const router = useRouter()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSubmit = async () => {
    try {
      const { dataConfig = {} } = watch()
      const json = await trigger({
        dataset_id: datasetId,
        dataConfig,
      })
      console.log(json, '---add data success')
    } catch (error) {}
  }

  const handleClick = async () => {
    if (active < 3) {
      setActive(active + 1)
    } else {
      await onSubmit()
      router.push(`/dataset/${datasetId}/data`)
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
