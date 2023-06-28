'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera } from 'lucide-react'
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

interface FormValuesProps {
  name: string
  desc?: string
  image?: string
}
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
  image: z.string().min(0),
})

const defaultValues = {
  name: '',
  desc: '',
  image: '',
}

const BasicsSetting = () => {
  const [image, setImage] = useState<UploadFile[]>([])
  const [disabled, setDisabled] = useState<boolean>()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'all',
  })
  const onSubmit = () => {
    console.log('-----onSubmit', watch())
  }
  const handleFiles = (file: UploadFile[]) => {
    setImage([])
    if (file[0]?.status === 'uploading') {
      setDisabled(true)
    } else {
      setDisabled(false)
    }
    setImage(file)
    setValue('image', file[0]?.url || '')
  }
  const { reset, setValue, watch } = form

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
                      // onSubmit()
                      const name = watch('name')
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
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="relative h-16 w-16 rounded-lg border bg-orange-600">
                      A
                      <Upload
                        listType="image"
                        accept=".png, .jpeg,.webp,.jpg"
                        fileList={image}
                        handleFiles={handleFiles}
                        customRequest={() => {}}
                        showUploadList={false}
                        disabled={disabled}
                        className="absolute bottom-[-8px] right-[-8px] h-6 w-6 rounded-full border bg-white text-black"
                      >
                        <Button
                          className="h-6 w-6 rounded-full border bg-white text-black"
                          variant="outline"
                          size="icon"
                        >
                          <Camera size={16} strokeWidth={2} />
                        </Button>
                      </Upload>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </form>
      </Form>
    </div>
  )
}

export default BasicsSetting
