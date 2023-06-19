'use client'

import { LightbulbIcon, PlusIcon, RocketIcon, WrenchIcon } from 'lucide-react'

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function AddTaskButton() {
  return (
    <TooltipProvider delayDuration={0}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Add task
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-96" align="start">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LightbulbIcon className="mr-3 mt-1 h-6 w-6 shrink-0 self-start" />
              <div className="flex-1">
                <div className="font-medium">Models</div>
                <div className="mt-1 text-slate-500">
                  Models or integrated models, such as large language model
                  GPT-4.
                </div>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-80 p-0">
                <Command>
                  <CommandInput placeholder="Search" />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="LLMs">
                      <CommandItem>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1 truncate">
                              <div className="font-medium">gpt-3.5-turbo</div>
                              <div className="mt-1 truncate text-slate-500">
                                Most capable GPT-3.5 model and optimized for
                                chat at 1/10th the cost of text-davinci-003.
                                Will be updated with our latest model iteration
                                2 weeks after it is released.
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="max-w-xs">
                              Most capable GPT-3.5 model and optimized for chat
                              at 1/10th the cost of text-davinci-003. Will be
                              updated with our latest model iteration 2 weeks
                              after it is released.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </CommandItem>
                      <CommandItem>
                        <div className="flex-1">
                          <div className="font-medium">gpt-4</div>
                          <div className="mt-1 text-slate-500">
                            More capable than any GPT-3.5 model, able to do more
                            complex tasks, and optimized for chat. Will be
                            updated with our latest model iteration 2 weeks
                            after it is released.
                          </div>
                        </div>
                      </CommandItem>
                      <CommandItem>
                        <div className="flex-1">
                          <div className="font-medium">claude v1</div>
                          <div className="mt-1 text-slate-500">
                            Claude is a next-generation AI assistant based on
                            Anthropic’s research into training helpful, honest,
                            and harmless AI systems.
                          </div>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <WrenchIcon className="mr-3 mt-1 h-6 w-6 shrink-0 self-start" />
              <div className="flex-1">
                <div className="font-medium">Tools</div>
                <div className="mt-1 text-slate-500">
                  Some encapsulated tools to handle certain tasks.
                </div>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-80 p-0">
                <Command>
                  <CommandInput placeholder="Search" />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Tool">
                      {[...Array(10)].map((_, i) => (
                        <CommandItem key={i}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-1 truncate">
                                <div className="font-medium">
                                  Tool {i + 1} title
                                </div>
                                <div className="mt-1 truncate text-slate-500">
                                  Tool {i + 1} description
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="max-w-xs">
                                Tool {i + 1} description
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <RocketIcon className="mr-3 mt-1 h-6 w-6 shrink-0 self-start" />
              <div className="flex-1">
                <div className="font-medium">Agents</div>
                <div className="mt-1 text-slate-500">
                  Task scheduler, automatically selects the appropriate tool to
                  call.
                </div>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-80 p-0">
                <Command>
                  <CommandInput placeholder="Search" />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Agents">
                      {[...Array(10)].map((_, i) => (
                        <CommandItem key={i}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-1 truncate">
                                <div className="font-medium">
                                  Agent {i + 1} title
                                </div>
                                <div className="mt-1 truncate text-slate-500">
                                  Agent {i + 1} description
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p className="max-w-xs">
                                Agent {i + 1} description
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
