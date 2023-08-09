'use client'

import { useState } from 'react'
import { Mention, MentionsInput } from 'react-mentions'

import './mention-style/mentionInput.css'

import { FieldValues, useFormContext } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { ITextareaItem } from './form-item'
import { useWorkflowContext } from './store'
import { WorkflowItem } from './type'

function ToolVariableMentions<T extends FieldValues>({
  label,
  name,
}: ITextareaItem<T>) {
  const form = useFormContext<T>()
  const { getValues } = form
  const [prompt, setPrompt] = useState(getValues()?.prompt.template)
  const workflowData = useWorkflowContext((state) => state.workflowData)
  const data = workflowData?.reduce(
    (m: { id: string; display: string }[], item: WorkflowItem) => {
      const key = `${item?.type}-${item?.key}.output`
      m?.push({ id: key, display: key })
      return m
    },
    []
  )
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <MentionsInput
              value={prompt}
              onChange={(e) => {
                setPrompt(e?.target?.value)
                // @ts-ignore
                form.setValue(name, e?.target?.value)
              }}
              className="mentions"
            >
              <Mention
                className="mentions__mention"
                data={data}
                markup="{__display__}"
                trigger={'{'}
                displayTransform={(id, display) => {
                  return `{${display}}`
                }}
              />
            </MentionsInput>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default ToolVariableMentions
