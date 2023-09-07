'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'

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
}

const AnnotatedForm = ({ form }: IProps) => {
  const { watch } = form
  console.log(watch(), '---watch')
  return (
    <FormField
      control={form.control}
      name="dataConfig.notedData"
      render={() => (
        <FormItem>
          {mockData.map((item) => (
            <FormField
              key={item.app_id}
              control={form.control}
              name="dataConfig.notedData"
              render={({ field }) => {
                return (
                  <FormItem
                    key={item.app_id}
                    className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-slate-200 p-4"
                  >
                    <FormControl>
                      <Checkbox
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
                    <FormLabel className="flex items-center gap-2 truncate text-sm font-normal text-black">
                      <img
                        src={item?.icon}
                        alt="app icon"
                        className="h-8 w-8 shrink-0 rounded-[5px]"
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
