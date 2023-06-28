'use client'

import { useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '@/lib/utils'
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
import { UploadFile } from '@/components/upload/type'
import Upload from '@/components/upload/upload'

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: 'App name at least 2 characters.',
    })
    .max(50, { message: 'App name must be less than 50 characters.' }),
  desc: z
    .string()
    .max(120, {
      message: 'Short description must be less than 120 characters.',
    })
    .min(0),
})

const defaultValues = {
  name: '',
  desc: '',
}

const BasicsSetting = () => {
  const [image, setImage] = useState<UploadFile[]>([])
  const currentImage = useRef({ url: '' })
  const [disabled, setDisabled] = useState<boolean>(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'all',
  })
  const onSubmit = () => {
    console.log('-----onSubmit', watch(), 'image is:', currentImage.current.url)
  }
  const handleFiles = (file: UploadFile[]) => {
    setImage([])
    if (file[0]?.status === 'uploading') {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
    setImage(file)
    if (file[0]?.url) {
      currentImage.current.url = file[0]?.url
      console.log('-----image upload success', currentImage.current.url)
      onSubmit()
    }
  }
  const { watch } = form
  return (
    <div className="mx-6 mt-16 w-[530px]">
      <h6 className="mb-6	text-2xl	font-semibold leading-8">Basics</h6>
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
            name="desc"
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
            showUploadList={{}}
            showFileList={false}
            actionsType={{ onlyUpload: true }}
            disabled={disabled}
            className="z-1 absolute bottom-[-8px] right-[-8px] h-6 w-6 rounded-full border bg-white text-black"
          >
            <Button
              className="h-6 w-6 rounded-full border"
              variant="outline"
              size="icon"
            >
              {image[0]?.status === 'uploading' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Camera size={16} strokeWidth={2} />
              )}
            </Button>
          </Upload>
        </div>
      </div>
    </div>
  )
}

export default BasicsSetting
