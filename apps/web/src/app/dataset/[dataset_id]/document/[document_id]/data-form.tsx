'use client'

import { useState, useTransition } from 'react'
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

import { DataSchemeProps, NotedDataProps } from '../../../type'
import { DataSchema } from '../../settings/documents/utils'
import { useDataContext } from './data-context'
import DocumentLoader from './document-loader'
import Preview from './preview'
import TextSplits from './splitter'

export interface FormProps {
  datasetId: string
  documentId: string
  defaultValues: DataSchemeProps
  active: number
  apps: NotedDataProps[]
  setActive: (s: number) => void
  setUploading?: (s: boolean) => void
}

function addData(
  url: string,
  { arg }: { arg: { dataset_id: string; dataConfig: DataSchemeProps } }
) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

function editData(
  url: string,
  {
    arg,
  }: {
    arg: {
      dataset_id: string
      dataConfig: DataSchemeProps
      document_id: string
    }
  }
) {
  return fetcher(url, {
    method: 'PATCH',
    body: JSON.stringify(arg),
  })
}

function getPreview(
  url: string,
  {
    arg,
  }: {
    arg: {
      dataset_id: string
      dataConfig: DataSchemeProps
      document_id: string
      preview: number
    }
  }
) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

const DataForm = () => {
  const { defaultValues, documentId, datasetId, step, setStep, isAdd } =
    useDataContext()
  const [isPending, startTransition] = useTransition()
  const [previews, setPreviews] = useState([])
  const { toast } = useToast()

  const form = useForm<z.infer<typeof DataSchema>>({
    resolver: zodResolver(DataSchema),
    defaultValues,
  })

  const { watch } = form

  const [data, setData] = useState<any[]>(defaultValues?.files || [])

  const { trigger: addTrigger, isMutating } = useSWRMutation(
    `/api/datasets/document`,
    addData
  )

  const { trigger: editTrigger, isMutating: editMutating } = useSWRMutation(
    `/api/datasets/document`,
    editData
  )

  const { trigger: previewTrigger, isMutating: previewMutating } =
    useSWRMutation(`/api/datasets/preview`, getPreview)
  const router = useRouter()
  const onSubmit = async () => {
    try {
      const dataConfig = { ...watch() }
      let json
      if (isAdd) {
        json = await addTrigger({
          dataset_id: datasetId,
          dataConfig,
        })
      } else {
        json = await editTrigger({
          dataset_id: datasetId,
          dataConfig,
          document_id: documentId,
        })
      }

      console.log(json, documentId ? 'edit data success' : 'add data success')
    } catch (error) {}
  }

  const handleClick = async () => {
    const files = watch()?.files
    const notedData = watch()?.notedData
    const type = watch()?.loaderType
    const isPdf = type === 'pdf'
    const dataConfig = { ...watch() }
    const text = type === 'pdf' ? 'document' : 'Annotated Data'
    if ((!files?.length && isPdf) || (!notedData?.length && !isPdf)) {
      toast({
        variant: 'destructive',
        description: `Please select a ${text}.`,
      })
      return
    }
    if (step == 1) {
      setStep?.(step + 1)
      return
    }
    if (step === 2) {
      setStep?.(step + 1)
      previewTrigger({
        dataset_id: datasetId,
        dataConfig,
        document_id: documentId,
        preview: 5,
      }).then((res) => {
        setPreviews(res)
      })

      return
    } else {
      await onSubmit()

      startTransition(() => {
        router.push(`/dataset/${datasetId}/settings/documents`)
      })
    }
  }
  return (
    <div className={cn('h-full w-full')}>
      <div
        className={cn(
          'sm:w-full md:max-w-[600px]',
          step === 3 && 'md:max-w-[740px]'
        )}
      >
        <Form {...form}>
          <form className="w-full">
            {step === 1 && (
              <DocumentLoader form={form} data={data} setData={setData} />
            )}
            {step === 2 && <TextSplits form={form} />}
            {step === 3 && (
              <Preview data={previews} isLoading={previewMutating} />
            )}
          </form>
        </Form>
        <div className={cn('flex justify-between', step == 1 && 'justify-end')}>
          {step !== 1 && (
            <Button variant="outline" onClick={() => setStep?.(step - 1)}>
              Previous
            </Button>
          )}
          <div className="flex  gap-2">
            <Button
              variant="outline"
              onClick={() => {
                form.reset()
                router.push(`/dataset/${datasetId}/settings/documents`)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClick}
              disabled={isPending || isMutating || editMutating}
            >
              {step !== 3
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
