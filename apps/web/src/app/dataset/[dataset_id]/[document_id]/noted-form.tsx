'use client'

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
  return (
    <FormField
      control={form.control}
      name="dataConfig.files"
      render={() => (
        <FormItem>
          {notedData?.map((item) => {
            const isDisabled =
              disabledData?.findIndex((cur) => cur?.id === item?.id) !== -1
            const isSelect = selected?.id === item?.id
            return (
              <FormField
                key={item.id}
                control={form.control}
                name="dataConfig.files"
                render={({ field }) => {
                  return (
                    <FormItem
                      data-disabled={isDisabled}
                      key={item.id}
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
                              (cur: any) => cur?.id === item?.id
                            ) !== -1 || isDisabled
                          }
                          className={!isAdd ? 'hidden' : 'block'}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field?.value, item])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: any) => value?.id !== item.id
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
