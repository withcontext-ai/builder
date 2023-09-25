'use client'

import { useEffect, useState } from 'react'
import { Loader2Icon, Plus, X } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'

import { fetcher } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { NotedDataProps } from '@/app/dataset/type'

import { useDataContext } from './data-context'
import NotedDataCard from './noted-data-card'
import AnnotatedForm from './noted-form'

interface IProps {
  form: UseFormReturn<any>
}

function getDisabledData(url: string) {
  return fetcher(url, {
    method: 'GET',
  })
}

const AddAnnotatedData = ({ form }: IProps) => {
  const { watch } = form
  const { defaultValues, documentId, datasetId } = useDataContext()
  const notedData = defaultValues?.notedData || []
  const [disabledData, setDisabledData] = useState<NotedDataProps[]>([])
  const [data, setData] = useState(notedData)
  const [open, setOpen] = useState(false)
  const { trigger, isMutating } = useSWRMutation(
    `/api/datasets/document?dataset_id=${datasetId}`,
    getDisabledData
  )
  const [current, setCurrent] = useState<NotedDataProps[]>(data)
  const isAdd = documentId === 'add'
  const type = watch()?.loaderType

  const deleteNotedData = (id: string) => {
    const newData =
      data?.filter((item: NotedDataProps) => item?.uid !== id) || []
    form.setValue('notedData', newData)
    setData(newData)
    setCurrent(newData)
  }
  useEffect(() => {
    const noted = watch()?.notedData
    setData(noted)
    setCurrent(noted)
  }, [type, watch])
  const showButton = isAdd || (!isAdd && data?.length == 0)

  const choseNotedData = async () => {
    const data = await trigger()
    setDisabledData(data)
  }
  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          {showButton && (
            <Button
              type="button"
              onClick={choseNotedData}
              disabled={isMutating}
            >
              {isMutating ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add Annotated Data
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent className="flex max-h-[60%] flex-col overflow-hidden p-0">
          <AnnotatedForm
            form={form}
            current={current}
            data={data}
            setData={setData}
            disabledData={disabledData}
            setCurrent={setCurrent}
            setOpen={setOpen}
          />
        </AlertDialogContent>
      </AlertDialog>
      <div className="mt-4 space-y-2">
        {data?.map((item: NotedDataProps) => {
          return (
            <div
              key={item?.uid}
              className="flex flex-row items-center justify-between gap-2 space-x-3 space-y-0 truncate rounded-lg border border-slate-200 p-4"
            >
              <NotedDataCard data={item} />
              <Button
                variant="outline"
                type="button"
                className="h-8 w-8 p-0 text-black"
                onClick={() => deleteNotedData(item?.uid || '')}
              >
                <X size={16} />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AddAnnotatedData
