'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
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
  defaultValues: DataSchemeProps
  active: number
  setActive: (s: number) => void
  setUploading?: (s: boolean) => void
}

type Params = DataSchemeProps

function addData(
  url: string,
  { arg }: { arg: { dataset_id: string; dataConfig: any } }
) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

const DataForm = ({
  datasetId,
  active,
  defaultValues,
  setActive,
  documentId,
}: FormProps) => {
  const [isPending, startTransition] = useTransition()

  const isAdd = documentId === 'add'
  const files = defaultValues?.dataConfig?.files || []
  // const uploadFiles = useMemo(() => {
  //   const files = defaultValues?.dataConfig?.files
  //   console.log(files, '---files')
  //   return files
  //     ? files.reduce((m: FileProps[], item: FileProps) => {
  //         const file = stringUrlToFile(item)
  //         m?.push(file)
  //         return m
  //       }, [])
  //     : []
  // }, [defaultValues])

  const [data, setData] = useState<FileProps[]>(files)
  // const [values, setValues] = useState<DataSchemesProps>(config)
  const form = useForm<z.infer<typeof DataSchema>>({
    resolver: zodResolver(DataSchema),
    defaultValues,
  })

  const { handleSubmit, watch } = form

  const { trigger, isMutating } = useSWRMutation(
    `/api/datasets/document`,
    addData
  )
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

      startTransition(() => {
        router.push(`/dataset/${datasetId}/data`)
      })
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
              <DocumentLoader form={form} data={files} setData={setData} />
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
            <Button onClick={handleClick} disabled={isPending || isMutating}>
              {active !== 3
                ? 'Next'
                : isPending || isMutating
                ? 'Saving'
                : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default DataForm
