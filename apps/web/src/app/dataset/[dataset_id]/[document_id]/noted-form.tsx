'use client'

import { useState } from 'react'
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

const mockData = [
  {
    icon: '	https://storage.googleapis.com/context-builder/public-tmp/NSB0kHEX13UW.jpg',
    name: 'Roleplay - Interviewer',
    app_id: '1',
  },
  {
    icon: 'https://storage.googleapis.com/context-builder/public-tmp/NSB0kHEX13UW.jpg',
    name: 'English Translator',
    app_id: '2',
  },
  {
    icon: 'https://storage.googleapis.com/context-builder/public-tmp/NSB0kHEX13UW.jpg',
    name: 'Product Customer Service',
    app_id: '3',
  },
  {
    icon: 'https://storage.googleapis.com/context-builder/public-tmp/NSB0kHEX13UW.jpg',
    name: 'An Useful App',
    app_id: '4',
  },
]
interface IProps {
  form: UseFormReturn<any>
  selected?: any
  setSelected?: (s: any) => void
  isAdd?: boolean
}

const AnnotatedForm = ({ form, isAdd, selected, setSelected }: IProps) => {
  return (
    <FormField
      control={form.control}
      name="dataConfig.notedData"
      render={() => (
        <FormItem className="">
          {mockData.map((item) => (
            <FormField
              key={item.app_id}
              control={form.control}
              name="dataConfig.notedData"
              render={({ field }) => {
                return (
                  <FormItem
                    key={item.app_id}
                    onClick={() => {
                      if (!isAdd) {
                        setSelected?.(item)
                      }
                    }}
                    className={cn(
                      'flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-slate-200 p-4',
                      !isAdd && 'cursor-pointer',
                      selected?.app_id === item?.app_id
                        ? 'border-blue-500'
                        : 'border-slate-200'
                    )}
                  >
                    <FormControl>
                      <Checkbox
                        className={!isAdd ? 'hidden' : 'block'}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field?.value, item])
                            : field.onChange(
                                field.value?.filter(
                                  (value: any) => value !== item.app_id
                                )
                              )
                        }}
                      />
                    </FormControl>
                    <FormLabel
                      className={cn(
                        'flex items-center gap-2 truncate text-sm font-normal text-black',
                        !isAdd && 'cursor-pointer'
                      )}
                    >
                      <img
                        src={item?.icon}
                        alt="app icon"
                        className={cn(
                          'h-8 w-8 shrink-0 rounded-[5px]',
                          !isAdd && 'cursor-pointer'
                        )}
                      />
                      {item.name}
                    </FormLabel>
                  </FormItem>
                )
              }}
            />
          ))}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default AnnotatedForm
