'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
      <DropdownMenuContent className="w-96" align="start" side="top">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
          </CommandList>
        </Command>
        <DropdownMenuGroup>
          {TEMPLATES.map((item) => {
            return (
              <DropdownMenuItem key={item.title}>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="mt-1 line-clamp-2 text-slate-500">
                    {item.prompt}
                  </div>
                </div>
                <DropdownMenuPortal></DropdownMenuPortal>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export default AddTemplateButton
