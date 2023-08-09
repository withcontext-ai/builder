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

function ToolVariableMentions<T extends FieldValues>({
  label,
  name,
}: ITextareaItem<T>) {
  const users = [
    {
      id: 'isaac',
      display: 'Isaac Newton',
    },
    {
      id: 'sam',
      display: 'Sam Victor',
    },
    {
      id: 'emma',
      display: 'emmanuel@nobody.com',
    },
  ]
  const form = useFormContext<T>()
  const { getValues } = form
  const [prompt, setPrompt] = useState(getValues()?.prompt.template)
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
                console.log(e?.target?.value, '-e?.target?.value')
                // @ts-ignore
                form.setValue(name, e?.target?.value)
              }}
              className="mentions"
            >
              <Mention
                className="mentions__mention"
                data={users}
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
