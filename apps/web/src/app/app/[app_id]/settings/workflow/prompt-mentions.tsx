'use client'

import { useEffect, useState } from 'react'
import { findIndex } from 'lodash'
import { FieldValues, useFormContext } from 'react-hook-form'
import { Mention, MentionsInput } from 'react-mentions'

import useMentionsValue from '@/hooks/use-mention-value'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { ITextareaItem } from './form-item'
import styles from './mention-style/mentionInput.module.css'
import { useWorkflowContext } from './store'
import { WorkflowItem } from './type'

function PromptMentions<T extends FieldValues>({
  label,
  name,
}: ITextareaItem<T>) {
  const form = useFormContext<T>()
  const { watch } = form
  const prompt = watch()?.prompt.template
  const { value, onChange, onAdd } = useMentionsValue(prompt)
  const workflowData = useWorkflowContext((state) => state.workflowData)

  const data = workflowData?.reduce(
    (m: { id: string; display: string }[], item: WorkflowItem) => {
      const key = `${item?.type}-${item?.key}.output`
      m?.push({ id: key, display: key })
      return m
    },
    []
  )

  useEffect(() => {
    onChange(prompt)
    const reg = /{(.*?)}/
    const selectedOutput = prompt.split(reg)?.filter(
      (item: string) =>
        findIndex(data, function (o) {
          return o.display === item
        }) !== -1
    )
    // @ts-ignore
    form.setValue('prompt.input_variables', selectedOutput)
  }, [prompt])
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <MentionsInput
              value={value}
              onChange={(e) => {
                onChange(e.target.value)

                // @ts-ignore
                form.setValue(name, e?.target?.value)
              }}
              customSuggestionsContainer={(children) => (
                <div className="w-[212px] rounded-md border bg-white p-2 text-sm font-medium shadow-sm">
                  {children}
                </div>
              )}
              classNames={styles}
            >
              <Mention
                className={styles.mentions__mention}
                data={data}
                markup="{__display__}"
                trigger={/(?:^|.)({([^.{]*))$/}
                appendSpaceOnAdd
                onAdd={onAdd}
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

export default PromptMentions
