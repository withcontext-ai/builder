'use client'

import { useState } from 'react'
import { CommandGroup } from 'cmdk'
import { Plus } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { IFormSchema } from './task-item-conversational-retrieval-qa'

const TEMPLATES = [
  {
    title: 'role play - interviewer',
    prompt: `Prompt type: chat prompt template
    System Message: 
    I want you to act as an interviewer. I will be the candidate and you will ask me the interview questions for the {position} position. I want you to only reply as the interviewer. Do not write all the conservation at once. I want you to only do the interview with me. Ask me the questions and wait for my answers.
    Human Message: 
    Format  prompt values: 
    {"position":"Elementary Math Teacher"}`,
  },
  {
    title: 'Multilingual translation assistant',
    prompt: `Prompt type: chat prompt template
    System Message: 
    You are a helpful assistant that translates {input_language} to {output_language}.
    Format  prompt values: 
    {  "input_language": "English ",
      "output_language": "French"
    }`,
  },
  {
    title: 'Product customer service',
    prompt: `Prompt type: chat prompt template
    System Message: You are a customer service agent, answering customer questions. Only answer what you know.
    Human Message: 
    Format  prompt values: `,
  },
]

const AddTemplateButton = () => {
  const [open, setOpen] = useState(false)
  const form = useFormContext<IFormSchema>()
  const { setValue } = form
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-blue-800 hover:bg-white hover:text-blue-800"
        >
          <Plus size={16} />
          add
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="relative right-6 w-[332px]"
        alignOffset={-30}
        side="top"
      >
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {TEMPLATES.map((item) => {
                return (
                  <CommandItem
                    className="p-3"
                    value={item?.prompt}
                    key={item.title}
                    onSelect={(item) => {
                      setValue('prompt.template', item)
                      setOpen(false)
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="mt-1 line-clamp-2 text-slate-500">
                        {item.prompt}
                      </div>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export default AddTemplateButton
