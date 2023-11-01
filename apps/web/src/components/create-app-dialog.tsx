'use client'

import React, { ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import NiceModal from '@ebay/nice-modal-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

import { fetcher, nanoid } from '@/lib/utils'
import { NewApp } from '@/db/apps/schema'
import useNiceModal from '@/hooks/use-nice-modal'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import Upload from '@/components/upload/upload'
import { FileProps } from '@/components/upload/utils'

interface IProps {
  dialogTrigger?: ReactNode
  submit?: () => void
  defaultValues?: z.infer<typeof formSchema>
  isCopy?: boolean
}

interface FormValuesProps {
  name: string
  description?: string
  icon?: string
}
const formSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty('App name is required.')
    .min(2, {
      message: 'App name must be at least 2 characters.',
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

function addApp(
  url: string,
  { arg }: { arg: Partial<NewApp> & { isCopy?: boolean } }
) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

export default NiceModal.create((props: IProps) => {
  const { modal, onOpenChange } = useNiceModal()
  const { dialogTrigger, defaultValues: _defaultValues, isCopy, submit } = props

  const defaultValues = {
    name: _defaultValues?.name || '',
    description: _defaultValues?.description || '',
    icon: _defaultValues?.icon || '',
  }
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })
  const { reset, setValue } = form
  const { toast } = useToast()
  const _image = defaultValues?.icon
    ? [
        {
          uid: nanoid(),
          url: defaultValues?.icon,
          type: 'image',
          name: '',
        },
      ]
    : []
  const [image, setImage] = useState<FileProps[]>(_image)
  const [uploading, setUploading] = useState(false)
  const { trigger, isMutating } = useSWRMutation('/api/me/apps', addApp)

  const onSubmit = async (data: FormValuesProps) => {
    try {
      await submit?.()
      const params = { ...defaultValues, ...data }
      const json = await trigger({ ...params, isCopy })
      onOpenChange(false)
      mutate('/api/me/workspace')
      const nextUrl = `/app/${json.appId}/session/${json.sessionId}`
      router.push(`/app/${json.appId}/settings/basics?nextUrl=${nextUrl}`)
      router.refresh()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Create failed!',
        description: error.message,
      })
    }
  }
  const handleCancel = () => {
    reset()
    onOpenChange(false)
    if (isCopy) {
      setImage(_image)
    } else {
      setImage([])
    }
  }

  const onChangeFileList = (file: FileProps[]) => {
    setImage(file)
    setValue('icon', file[0]?.url || '')
  }

  return (
    <AlertDialog open={modal.visible} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{dialogTrigger}</AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[488px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Create App</AlertDialogTitle>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      maxRows={8}
                      placeholder="Type your description here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={() => {
                return (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Upload
                        listType={image?.length ? 'update-image' : 'image'}
                        setUploading={setUploading}
                        accept=".png, .jpeg,.webp,.jpg"
                        fileList={image}
                        onChangeFileList={onChangeFileList}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating || uploading}>
                {isMutating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
})
