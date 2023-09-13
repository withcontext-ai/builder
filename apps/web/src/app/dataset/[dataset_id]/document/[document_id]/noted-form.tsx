'use client'

import { I } from 'drizzle-orm/db.d-b9835153'
import { omit } from 'lodash'
import { UseFormReturn } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useDataContext } from './data-context'
import NotedDataCard from './noted-data-card'

interface IProps {
  form: UseFormReturn<any>
  selected?: any
  setSelected?: (s: any) => void
}

const AnnotatedForm = ({ form, selected, setSelected }: IProps) => {
  const { disabledData, notedData, isAdd } = useDataContext()
  const { getValues } = form
  return (
    <FormField
      control={form.control}
      name="dataConfig.notedData"
      render={() => (
        <FormItem>
          {notedData?.map((item) => {
            const isDisabled =
              disabledData?.findIndex((cur) => cur?.uid === item?.uid) !== -1
            const isSelect = selected?.uid === item?.uid
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
                          setSelected?.(item)
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
                            field.value?.findIndex(
                              (cur: any) => cur?.uid === item?.uid
                            ) !== -1 || isDisabled
                          }
                          className={!isAdd ? 'hidden' : 'block'}
                          onCheckedChange={(checked) => {
                            item.type = 'annotated data'
                            const config = omit(getValues().dataConfig, [
                              'files',
                              'notedData',
                              'icon',
                            ])
                            const cur = { ...config, ...item }
                            return checked
                              ? field.onChange([...field?.value, cur])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: any) => value?.uid !== item.uid
                                  )
                                )
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
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default AnnotatedForm
