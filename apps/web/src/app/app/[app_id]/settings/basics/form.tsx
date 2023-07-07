'use client'

import { useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

import { cn, fetcher } from '@/lib/utils'
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
import { UploadFile, UploadFileStatus } from '@/components/upload/type'
import Upload from '@/components/upload/upload'

function editApp(
  url: string,
  { arg }: { arg: { name: string; description: string; icon: string } }
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
    .min(2, {
      message: 'App name at least 2 characters.',
    })
    .max(50, { message: 'App name must be less than 50 characters.' }),
  description: z
    .string()
    .max(300, {
      message: 'Short description must be less than 300 characters.',
    })
    .min(0),
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
  const stringUrlToFile = () => {
    const icon = defaultValues?.icon
    const status: UploadFileStatus = 'success'
    return icon
      ? [
          {
            url: icon,
            name: '',
            uid: nanoid(),
            status,
          },
        ]
      : []
  }
  const [image, setImage] = useState<UploadFile<any>[]>(stringUrlToFile())
  const currentImage = useRef({ url: '' })
  const [disabled, setDisabled] = useState<boolean>(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'all',
  })

  const onSubmit = async () => {
    if (!form.formState.isValid) return

    console.log('-----onSubmit', watch(), 'image is:', currentImage.current.url)

    const newValue = {
      name: watch().name,
      description: watch().description,
      icon: watch().icon || '',
      // icon: currentImage.current.url,
    }

    await trigger(newValue)
    toast({ description: 'Update successfully.' })
  }
  const handleFiles = (file: UploadFile<any>[]) => {
    const lens = file?.length
    if (file[lens - 1]?.status === 'uploading') {
      setDisabled(true)
    }
    setImage([file[lens - 1]])
    if (file[lens - 1]?.url) {
      currentImage.current.url = file[lens - 1]?.url || ''
      setDisabled(false)
      onSubmit()
    }
  }
  const { watch, setError } = form

  return (
    <div>
      <h6 className="mb-6	text-2xl font-semibold leading-8">Basics</h6>
      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex">
                  App Name <div className="text-red-500">*</div>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Give your App a name"
                    {...field}
                    onBlur={(e) => {
                      if (watch().name?.length < 2) {
                        setError('name', {
                          type: 'string',
                          message: 'App name at least 2 characters.',
                        })
                      }
                      onSubmit()
                    }}
                  />
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
                    onBlur={() => {
                      onSubmit()
                    }}
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
        <div
          className={cn(
            'relative flex h-16 w-16 items-center justify-center rounded-lg border-0 bg-orange-600',
            image[0]?.status === 'error' ? 'border-[#ff4d4f]' : '',
            image[0]?.status === 'uploading' ? 'bg-gray-50' : '',
            image[0]?.status === 'success'
              ? 'border border-gray-100 bg-white'
              : ''
          )}
        >
          {image?.length === 0 ? (
            'A'
          ) : image[0]?.status === 'uploading' ? (
            <div className="bg-slate-100">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          ) : (
            <div>
              <img src={image[0]?.url} alt="image" />
            </div>
          )}
          <Upload
            listType="image"
            accept=".png,.jpeg,.webp,.jpg"
            fileList={image}
            handleFiles={(file) => handleFiles(file)}
            customRequest={() => {}}
            showFileList={false}
            onRemove={() => setImage([])}
            disabled={disabled}
            className="z-1 absolute bottom-[-8px] right-[-8px] h-6 w-6 rounded-full border bg-white text-black"
          >
            <Button
              className="h-6 w-6 rounded-full border"
              variant="outline"
              size="icon"
              disabled={disabled}
            >
              <Camera size={16} strokeWidth={2} />
            </Button>
          </Upload>
        </div>
      </div>
    </div>
  )
}
