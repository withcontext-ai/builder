'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { omit } from 'lodash'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

import { cn, fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { FileProps } from '@/components/upload/utils'

import { DataConfigProps, DataSchema, DataSchemeProps } from '../data/utils'
import DocumentLoader from './document-loader'
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

function editData(
  url: string,
  { arg }: { arg: { dataset_id: string; dataConfig: any; document_id: string } }
) {
  console.log(arg.dataConfig, '---args')
  return fetcher(url, {
    method: 'PATCH',
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
  const { toast } = useToast()

  const notedData = defaultValues?.dataConfig?.notedData || []
  const form = useForm<z.infer<typeof DataSchema>>({
    resolver: zodResolver(DataSchema),
    defaultValues,
  })

  const { watch } = form

  const files = defaultValues?.dataConfig?.files
  const [data, setData] = useState<any[]>(files)

  const { trigger: addTrigger, isMutating } = useSWRMutation(
    `/api/datasets/document`,
    addData
  )

  const { trigger: triggerEdit, isMutating: editMutating } = useSWRMutation(
    `/api/datasets/document`,
    editData
  )
  const router = useRouter()
  const onSubmit = async () => {
    try {
      const { dataConfig = {} } = watch()
      let json
      if (!documentId) {
        json = await addTrigger({
          dataset_id: datasetId,
          dataConfig,
        })
      } else {
        json = await triggerEdit({
          dataset_id: datasetId,
          dataConfig,
          document_id: documentId,
        })
      }

      console.log(json, documentId ? 'edit data success' : 'add data success')
    } catch (error) {}
  }

  const handleClick = async () => {
    const files = watch()?.dataConfig?.files
    const type = watch()?.dataConfig?.loaderType
    if (!files?.length && type === 'pdf') {
      toast({
        variant: 'destructive',
        description: 'Please select a document.',
      })
      return
    }
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
              <DocumentLoader
                form={form}
                data={data}
                notedData={notedData}
                setData={setData}
                documentId={documentId}
              />
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
              onClick={() => {
                form.reset()
                router.push(`/dataset/${datasetId}/data`)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleClick} disabled={isPending || isMutating}>
              {active !== 3
                ? 'Next'
                : isPending || isMutating || editMutating
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
