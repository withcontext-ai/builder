'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

import { cn, fetcher, getAvatarBgColor, getFirstLetter } from '@/lib/utils'
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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { UploadFile } from '@/components/upload/type'
import Upload from '@/components/upload/upload'
import { FileProps, stringUrlToFile } from '@/components/upload/utils'

function editApp(
  url: string,
  { arg }: { arg: { name: string; description?: string; icon?: string } }
) {
  return fetcher(url, {
    method: 'PATCH',
    body: JSON.stringify(arg),
  })
}

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty('App name is required.')
    .min(2, {
      message: 'App name at least 2 characters.',
    })
    .max(50, { message: 'App name must be less than 50 characters.' }),
  description: z
    .string()
    .max(300, {
      message: 'Short description must be less than 300 characters.',
    })
    .optional(),
  icon: z.string().optional(),
})

interface IProps {
  appId: string
  defaultValues: {
    name: string
    description: string
    icon: string
  }
}

export default function BasicsSettingForm({ appId, defaultValues }: IProps) {
  const { trigger } = useSWRMutation(`/api/apps/${appId}`, editApp)
  const { toast } = useToast()
  const values = defaultValues?.icon
    ? [
        {
          url: defaultValues?.icon,
          name: '',
        },
      ]
    : []
  const [image, setImage] = useState<FileProps[]>(values)
  const [disabled, setDisabled] = useState<boolean>(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const { watch, handleSubmit } = form

  const router = useRouter()
  const onSubmit = async () => {
    const newValue = watch()
    const response = await trigger(newValue)
    if (response?.error) {
      toast({ variant: 'destructive', description: response.error })
    } else {
      router.refresh()
    }
  }

  const color = getAvatarBgColor(appId)
  const bgText = getFirstLetter(watch().name || '')
  return (
    <div>
      <h6 className="mb-6	text-2xl font-semibold leading-8">Basics</h6>
      <Form {...form}>
        <form onBlur={handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex">
                  App Name <div className="text-red-500">*</div>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Give your App a name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea
                    minRows={3}
                    placeholder="Type your description here"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="mt-6">
        <div className="mb-2">Image</div>
        <Upload
          listType="update-image"
          accept=".png,.jpeg,.webp,.jpg"
          fileList={image}
          bgColor={color}
          listProps={false}
          bgText={bgText}
          onChangeFileList={(files) => {
            const current = files[files?.length - 1]
            form.setValue('icon', current?.url)
          }}
        />
      </div>
    </div>
  )
}
