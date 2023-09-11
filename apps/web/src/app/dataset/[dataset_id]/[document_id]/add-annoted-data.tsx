'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { NotedDataProps } from '../../type'
import NotedDataCard from './noted-data-card'
import AnnotatedForm from './noted-form'

interface IProps {
  form: UseFormReturn<any>
  notedData: any[]
  documentId?: string
  disabledData: NotedDataProps[]
  apps: NotedDataProps[]
}

const AddAnnotatedData = ({
  form,
  notedData,
  documentId,
  disabledData,
  apps,
}: IProps) => {
  const { watch } = form
  const [data, setData] = useState(notedData)
  const [selected, setSelected] = useState<any>()
  const isAdd = documentId === 'add'
  const type = watch()?.dataConfig?.loaderType

  const deleteNotedData = (id: string) => {
    const newData = data?.filter((item: any) => item?.id !== id) || []
    form.setValue('dataConfig?.notedData', newData)
    setData(newData)
  }
  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button">
            <Plus size={16} />
            Add Annotated Data
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Annotated Data</AlertDialogTitle>
            <AlertDialogDescription>
              <AnnotatedForm
                form={form}
                isAdd={isAdd}
                selected={selected}
                setSelected={setSelected}
                disabledData={disabledData}
                apps={apps}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!isAdd) {
                  setData([selected])
                  form.setValue('dataConfig?.notedData', selected)
                } else {
                  const notedData = watch()?.dataConfig?.notedData
                  setData(notedData)
                }
              }}
            >
              Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="mt-4 space-y-2">
        {data?.map((item: any) => {
          return (
            <div
              key={item?.app_id}
              className="flex flex-row items-center justify-between gap-2 space-x-3 space-y-0 truncate rounded-lg border border-slate-200 p-4"
            >
              <NotedDataCard data={item} />
              <Button
                variant="outline"
                type="button"
                className="h-8 w-8 p-0 text-black"
                onClick={() => deleteNotedData(item?.id)}
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
