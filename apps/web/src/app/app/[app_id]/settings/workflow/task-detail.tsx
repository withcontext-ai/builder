'use client'

import { Check, ChevronsUpDown, PlusIcon, TrashIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import * as z from 'zod'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

import { FormSchema } from './form-provider'

const models = [
  { label: 'OpenAI-GPT3.5', value: 'openai-gpt3dot5' },
  { label: 'OpenAI-GPT4', value: 'openai-gpt4' },
] as const

const datasets = [
  { label: 'Customer service documentation', value: 'd1' },
  { label: 'This is a Document with very very very long title.', value: 'd2' },
] as const

function labelFilter(value: string, search: string): number {
  const label = datasets.find((d) => d.value === value)?.label
  if (label?.toLowerCase().includes(search.toLowerCase())) return 1
  return 0
}

export default function TaskDetail() {
  const form = useFormContext<z.infer<typeof FormSchema>>()

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-lg font-semibold">Conversational Retrieval QA</h2>
      <div className="space-y-6">
        <div>
          <div className="text-sm font-medium text-slate-500">LLM</div>
          <div className="mt-4 space-y-8">
            <FormField
              control={form.control}
              name="model_name"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Model Name</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-[200px] justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? models.find((item) => item.value === field.value)
                                ?.label
                            : 'Select Model'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search model..." />
                        <CommandEmpty>No model found.</CommandEmpty>
                        <CommandGroup>
                          {models.map((item) => (
                            <CommandItem
                              value={item.value}
                              key={item.value}
                              onSelect={(value) => {
                                form.setValue('model_name', value)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  item.value === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {item.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {/* <FormDescription>
                  This is the language that will be used in the dashboard.
                </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex space-x-5">
              <FormField
                control={form.control}
                name="model_temperature"
                render={({ field }) => (
                  <FormItem className="flex flex-1 flex-col space-y-6">
                    <FormLabel>Temperature</FormLabel>
                    <Slider
                      name={field.name}
                      value={field.value}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model_temperature"
                render={({ field }) => (
                  <FormItem className="shrink-0 self-end">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="placeholder"
                        min={0}
                        max={1}
                        step={0.1}
                        {...field}
                        value={field.value[0]}
                        onChange={(e) => {
                          const value = +e.target.value
                          field.onChange([value])
                        }}
                        className="h-10 w-18"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="-mx-6 h-px shrink-0 bg-slate-100" />

        <div>
          <div className="text-sm font-medium text-slate-500">memory</div>
          <div className="mt-4 space-y-8">
            <FormField
              control={form.control}
              name="memory_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Memory Key</FormLabel>
                  <FormControl>
                    <Input placeholder="placeholder" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                    This is your public display name.
                  </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="-mx-6 h-px shrink-0 bg-slate-100" />

        <div>
          <div className="text-sm font-medium text-slate-500">prompt</div>
          <div className="mt-4 space-y-8">
            <FormField
              control={form.control}
              name="prompt_template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="placeholder"
                      minRows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="-mx-6 h-px shrink-0 bg-slate-100" />

        <div>
          <div className="text-sm font-medium text-slate-500">data</div>
          <div className="mt-4 space-y-8">
            <FormField
              control={form.control}
              name="data_datasets"
              render={({ field }) => (
                <FormItem>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button>
                          <PlusIcon className="mr-2 h-4 w-4" /> Add Dataset
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="end">
                      <Command filter={labelFilter}>
                        <CommandInput placeholder="Search dataset..." />
                        <CommandList>
                          <CommandEmpty>No dataset found.</CommandEmpty>
                          <CommandGroup>
                            {datasets.map((item) => (
                              <CommandItem
                                key={item.value}
                                value={item.value}
                                onSelect={(value) => {
                                  const newValue = [
                                    ...(field.value || []),
                                    value,
                                  ]
                                  form.setValue('data_datasets', newValue)
                                }}
                                data-disabled={
                                  field.value?.includes(item.value) || undefined
                                }
                              >
                                {item.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                  {field.value &&
                    field.value.length > 0 &&
                    field.value.map((value) => {
                      const label = datasets.find(
                        (d) => d.value === value
                      )?.label
                      return (
                        <div
                          key={value}
                          className="flex h-12 items-center justify-between space-x-2 rounded-lg border border-slate-200 pl-3 pr-1"
                        >
                          <div className="truncate text-sm font-normal">
                            {label}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              const newValue = field.value?.filter(
                                (v) => v !== value
                              )
                              form.setValue('data_datasets', newValue)
                            }}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </div>
                      )
                    })}
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
