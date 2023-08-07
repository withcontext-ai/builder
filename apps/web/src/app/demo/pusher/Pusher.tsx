'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import * as z from 'zod'

import { fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

function sendToWebhook(
  url: string,
  { arg }: { arg: { type: string; data: any } }
) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

const formSchema = z.object({
  message: z.string(),
})

export default function Pusher() {
  const { trigger, isMutating } = useSWRMutation(
    '/api/webhook/chat',
    sendToWebhook
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await trigger({ type: 'chat.created', data: values })
    form.reset()
    setTimeout(() => {
      form.setFocus('message')
    }, 0)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Input
                  placeholder="type here"
                  {...field}
                  disabled={isMutating}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isMutating}>
          {isMutating ? 'Publishing' : 'Publish'}
        </Button>
      </form>
    </Form>
  )
}
