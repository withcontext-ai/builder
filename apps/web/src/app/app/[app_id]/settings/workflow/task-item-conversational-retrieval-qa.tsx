'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'

import {
  InputItem,
  ListSelectItem,
  SelectItem,
  SlideItem,
  TextareaItem,
} from './form-item'

const FormSchema = z.object({
  llm: z.object({
    model_name: z.string({
      required_error: 'Please select a model.',
    }),
  }),
  model_temperature: z.array(z.number().min(0).max(1)),
  memory_key: z.string().optional(),
  prompt_template: z.string().optional(),
  data_datasets: z.array(z.string()).optional(),
})

type IFormSchema = z.infer<typeof FormSchema>

interface FormProviderProps {
  children: React.ReactNode
  taskId: string
}

function FormProvider({ children, taskId }: FormProviderProps) {
  const form = useForm<IFormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      llm: {
        model_name: 'openai-gpt4',
      },
      model_temperature: [0.9],
      prompt_template: '',
    },
  })

  function onSubmit(data: IFormSchema) {
    toast({
      title: `Submit to task ${taskId}:`,
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
    </Form>
  )
}

const MODELS_OPTIONS = [
  { label: 'OpenAI-GPT3.5', value: 'openai-gpt3dot5' },
  { label: 'OpenAI-GPT4', value: 'openai-gpt4' },
]

const DATASETS_OPTIONS = [
  { label: 'Customer service documentation', value: 'd1' },
  { label: 'This is a Document with very very very long title.', value: 'd2' },
]

function FormItems() {
  return (
    <div className="h-full w-[380px] shrink-0 overflow-auto border-l border-slate-200">
      <div className="space-y-6 p-6">
        <h2 className="text-lg font-semibold">Conversational Retrieval QA</h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-500">LLM</div>
            <div className="space-y-8">
              <SelectItem<IFormSchema>
                name="llm.model_name"
                label="Model"
                options={MODELS_OPTIONS}
              />
              <SlideItem<IFormSchema>
                name="model_temperature"
                label="Temperature"
                min={0}
                max={2}
                step={0.1}
              />
            </div>
          </div>

          <div className="-mx-6 h-px shrink-0 bg-slate-100" />

          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-500">memory</div>
            <div className="space-y-8">
              <InputItem<IFormSchema> name="memory_key" label="Memory Key" />
            </div>
          </div>

          <div className="-mx-6 h-px shrink-0 bg-slate-100" />

          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-500">prompt</div>
            <div className="space-y-8">
              <TextareaItem<IFormSchema>
                name="prompt_template"
                label="Template"
              />
            </div>
          </div>

          <div className="-mx-6 h-px shrink-0 bg-slate-100" />

          <div className="space-y-4">
            <div className="text-sm font-medium text-slate-500">data</div>
            <div className="space-y-8">
              <ListSelectItem<IFormSchema>
                name="data_datasets"
                label="Dataset"
                options={DATASETS_OPTIONS}
              />
            </div>
          </div>

          <Button type="submit">Submit</Button>
        </div>
      </div>
    </div>
  )
}

interface IProps {
  taskId: string
}

export default function TaskItemConversationalRetrievalQA({ taskId }: IProps) {
  return (
    <FormProvider taskId={taskId}>
      <FormItems />
    </FormProvider>
  )
}
