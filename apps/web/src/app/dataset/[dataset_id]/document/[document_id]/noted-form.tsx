'use client'

import { useState } from 'react'
import { omit } from 'lodash'
import { UseFormReturn } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { NotedDataProps } from '@/app/dataset/type'

import { useDataContext } from './data-context'
import NotedDataCard from './noted-data-card'

interface IProps {
  form: UseFormReturn<any>
  current: NotedDataProps[]
  data?: NotedDataProps[]
  setOpen: (s: boolean) => void
  setCurrent: (s: NotedDataProps[]) => void
  setData: (s: NotedDataProps[]) => void
}

const AnnotatedForm = ({
  form,
  data = [],
  setOpen,
  setData,
  current,
  setCurrent,
}: IProps) => {
  const { disabledData, notedData, isAdd } = useDataContext()

  const { getValues } = form
  const onCancel = () => {
    setOpen(false)
    if (isAdd) {
      setCurrent?.(data)
      return
    } else {
      setCurrent([])
    }
  }

  const onSave = () => {
    setData?.(current)
    form.setValue('dataConfig.notedData', current)
    setOpen(false)
  }

  return (
    <div>
      <FormField
        control={form.control}
        name="dataConfig.notedData"
        render={() => (
          <FormItem>
            {notedData?.map((item) => {
              const isDisabled =
                disabledData?.findIndex((cur) => cur?.uid === item?.uid) !== -1
              const isSelect = !isAdd && current?.[0]?.uid === item?.uid
              return (
                <FormField
                  key={item.uid}
                  control={form.control}
                  name="dataConfig.notedData"
                  render={({ field }) => {
                    return (
                      <FormItem
                        data-disabled={isDisabled}
                        key={item.uid}
                        onClick={() => {
                          if (!isAdd && !isDisabled) {
                            setCurrent?.([item])
                          }
                        }}
                        className={cn(
                          'flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-slate-200 p-4',
                          !isAdd && !isDisabled && 'cursor-pointer',
                          !isAdd && 'space-x-0',
                          isSelect && !isDisabled
                            ? 'border-blue-500'
                            : 'border-slate-200'
                        )}
                      >
                        <FormControl>
                          <Checkbox
                            disabled={isDisabled}
                            checked={
                              current?.findIndex(
                                (cur: any) => cur?.uid === item?.uid
                              ) !== -1 || isDisabled
                            }
                            className={!isAdd ? 'hidden' : 'block'}
                            onCheckedChange={(checked) => {
                              item.type = 'annotated_data'
                              const config = omit(getValues().dataConfig, [
                                'files',
                                'notedData',
                                'icon',
                              ])
                              const cur = { ...config, ...item }
                              if (checked) {
                                setCurrent?.([...current, cur])
                              } else {
                                const newData =
                                  current?.filter(
                                    (cur: any) => cur?.uid !== item?.uid
                                  ) || []
                                setCurrent?.(newData)
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel>
                          <NotedDataCard data={item} isAdd={isAdd} />
                        </FormLabel>
                      </FormItem>
                    )
                  }}
                />
              )
            })}
          </FormItem>
        )}
      />

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  )
}

export default AnnotatedForm
