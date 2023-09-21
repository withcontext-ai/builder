'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
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

const AddAnnotatedData = ({ form }: IProps) => {
  const { watch } = form
  const { defaultValues, documentId } = useDataContext()
  const notedData = defaultValues?.notedData || []
  const [data, setData] = useState(notedData)
  const [open, setOpen] = useState(false)

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
  return (
    <div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          {showButton && (
            <Button type="button">
              <Plus size={16} />
              Add Annotated Data
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent className="flex max-h-[60%] flex-col overflow-hidden p-0">
          <AlertDialogHeader className="px-6 pt-6">
            <AlertDialogTitle>Add Annotated Data</AlertDialogTitle>
          </AlertDialogHeader>
          <AnnotatedForm
            form={form}
            current={current}
            data={data}
            setData={setData}
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
