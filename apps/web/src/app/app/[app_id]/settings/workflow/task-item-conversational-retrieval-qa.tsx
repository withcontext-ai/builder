'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRightIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import {
  InputItem,
  ListSelectItem,
  SelectItem,
  SlideItem,
  TextareaItem,
} from './form-item'
import { useWorkflowContext } from './store'
import useAutoSave from './use-auto-save'

interface IProps {
  taskId: string
  formValue: any
}

export default function TaskItemConversationalRetrievalQA({
  taskId,
  formValue,
}: IProps) {
  return (
    <FormProvider taskId={taskId} formValue={formValue}>
      <FormItems />
    </FormProvider>
  )
}

const FormSchema = z.object({
  llm: z.object({
    model_name: z.string({
      required_error: 'Please select a model.',
    }),
    api_key: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().min(0).max(2048).optional(),
    top_p: z.number().min(0).max(1).optional(),
    frequency_penalty: z.number().min(0).max(2).optional(),
    presence_penalty: z.number().min(0).max(2).optional(),
  }),
  prompt: z.object({
    type: z.string(),
    template: z.string().optional(),
    values: z.string().optional(),
  }),
  retriever: z.object({
    type: z.string(),
  }),
  data: z.object({
    datasets: z.array(z.string()).optional(),
  }),
})

type IFormSchema = z.infer<typeof FormSchema>

interface FormProviderProps {
  children: React.ReactNode
  taskId: string
  formValue: any
}

const DEFAULT_VALUES: IFormSchema = {
  llm: {
    model_name: 'openai-gpt-3.5-turbo',
    api_key: '',
    temperature: 0.9,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  },
  prompt: {
    type: 'prompt_template',
    template: '',
    values: '',
  },
  retriever: {
    type: 'pinecone_hybrid_search',
  },
  data: {
    datasets: [],
  },
}

function FormProvider({ children, taskId, formValue }: FormProviderProps) {
  const defaultValues = formValue || DEFAULT_VALUES

  const form = useForm<IFormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  const editTaskFormValueStr = useWorkflowContext(
    (state) => state.editTaskFormValueStr
  )

  function onSave(data: IFormSchema) {
    editTaskFormValueStr(taskId, JSON.stringify(data))
  }

  useAutoSave<IFormSchema>({ form, defaultValues, onSave })

  return (
    <Form {...form}>
      <form>{children}</form>
    </Form>
  )
}

function FormItems() {
  return (
    <div className="h-full w-[380px] shrink-0 overflow-auto border-l border-slate-200 scrollbar-none">
      <div className="space-y-6 p-6">
        <h2 className="text-lg font-semibold">Conversational Retrieval QA</h2>
        <div className="space-y-6">
          <FormItemLLM />
          <div className="-mx-6 h-px shrink-0 bg-slate-100" />
          <FormItemPrompt />
          <div className="-mx-6 h-px shrink-0 bg-slate-100" />
          <FormItemRetriever />
          <div className="-mx-6 h-px shrink-0 bg-slate-100" />
          <FormItemData />
        </div>
      </div>
    </div>
  )
}

const LLM_MODEL_NAME_OPTIONS = [
  { label: 'OpenAI-GPT-3.5', value: 'openai-gpt-3.5-turbo' },
  { label: 'OpenAI-GPT-4', value: 'openai-gpt-4' },
]

function FormItemLLM() {
  const [isExpend, setIsExpend] = React.useState(false)

  function toggle() {
    setIsExpend((v) => !v)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-500">LLM</div>
      <div className="space-y-8">
        <SelectItem<IFormSchema>
          name="llm.model_name"
          label="Model"
          options={LLM_MODEL_NAME_OPTIONS}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full bg-slate-100"
          onClick={toggle}
        >
          <ChevronRightIcon
            className={cn(
              'mr-2 h-4 w-4 transition-transform',
              isExpend && ' rotate-90'
            )}
          />
          More model options
        </Button>
        {isExpend && (
          <>
            <InputItem<IFormSchema> name="llm.api_key" label="OpenAI Key" />
            <SlideItem<IFormSchema>
              name="llm.temperature"
              label="Temperature"
              min={0}
              max={2}
              step={0.01}
            />
            <SlideItem<IFormSchema>
              name="llm.max_tokens"
              label="Max Tokens"
              min={0}
              max={2048}
              step={1}
            />
            <SlideItem<IFormSchema>
              name="llm.top_p"
              label="Top P"
              min={0}
              max={1}
              step={0.01}
            />
            <SlideItem<IFormSchema>
              name="llm.frequency_penalty"
              label="Frequency penalty"
              min={0}
              max={2}
              step={0.01}
            />
            <SlideItem<IFormSchema>
              name="llm.presence_penalty"
              label="Presence penalty"
              min={0}
              max={2}
              step={0.01}
            />
          </>
        )}
      </div>
    </div>
  )
}

const PROMPT_TYPE_OPTIONS = [
  { label: 'Prompt Template', value: 'prompt_template' },
]

function FormItemPrompt() {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-500">prompt</div>
      <div className="space-y-8">
        <SelectItem<IFormSchema>
          name="prompt.type"
          label="Type"
          options={PROMPT_TYPE_OPTIONS}
        />
        <TextareaItem<IFormSchema> name="prompt.template" label="Template" />
        <TextareaItem<IFormSchema> name="prompt.values" label="Values" />
      </div>
    </div>
  )
}

const RETRIEVER_TYPE_OPTIONS = [
  {
    label: 'Pinecone Hybrid Search',
    value: 'pinecone_hybrid_search',
  },
]

function FormItemRetriever() {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-500">retriever</div>
      <div className="space-y-8">
        <SelectItem<IFormSchema>
          name="retriever.type"
          label="Type"
          options={RETRIEVER_TYPE_OPTIONS}
        />
      </div>
    </div>
  )
}

const DATASETS_OPTIONS = [
  { label: 'Customer service documentation', value: 'd1' },
  { label: 'This is a Document with very very very long title.', value: 'd2' },
]

function FormItemData() {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-slate-500">data</div>
      <div className="space-y-8">
        <ListSelectItem<IFormSchema>
          name="data.datasets"
          label="Dataset"
          options={DATASETS_OPTIONS}
        />
      </div>
    </div>
  )
}
