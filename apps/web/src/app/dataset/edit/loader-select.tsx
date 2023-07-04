'use client'

import { RefObject, useState } from 'react'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import { FormProps, UseFormReturn } from 'react-hook-form'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface IProps {
  form: FormProps<any>
}

const types = [
  { label: 'Pdf loader', value: 'pdf loader' },
  { label: 'Comming soon...', value: 'comming soon' },
] as const

const LoaderSelect = ({ form }: IProps) => {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem className="mb-6 flex flex-col">
          <FormLabel className="flex">
            Type <div className="text-red-500">*</div>
          </FormLabel>
          <Popover open={open} onOpenChange={(open) => setOpen(open)}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'w-[308px] justify-between',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {field.value
                    ? types.find((type) => type.value === field.value)?.label
                    : 'Select Document Loader'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search Document Loader"
                  className="h-9"
                />
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {types.map((type) => (
                    <CommandItem
                      value={type.value}
                      key={type.value}
                      onSelect={(value) => {
                        console.log(value, '---value')
                        form.setValue('type', value)
                        setOpen(false)
                      }}
                      disabled={type?.value === 'comming soon'}
                    >
                      {type.label}
                      <CheckIcon
                        className={cn(
                          'ml-auto h-4 w-4',
                          type.value === field.value
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
export default LoaderSelect
