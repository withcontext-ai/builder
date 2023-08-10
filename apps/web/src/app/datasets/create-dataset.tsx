'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

import { fetcher } from '@/lib/utils'
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

import { SchemaProps } from '../dataset/[dataset_id]/settings/setting-page'
import { FormSchema } from '../dataset/[dataset_id]/settings/utils'

const defaultValues = {
  name: '',
  loaderType: 'pdf',
  splitType: 'character',
  files: [],
  chunkSize: 1000,
  chunkOverlap: 0,
  embeddingType: 'openAI',
  storeType: 'pinecone',
  collectionName: '',
  chromaUrl: '',
  apiKey: '',
  instanceName: '',
  developmentName: '',
  apiVersion: '',
}

function addDataset(url: string, { arg }: { arg: SchemaProps }) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

const CreateDialog = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { trigger, isMutating } = useSWRMutation(
    `/api/datasets/add-dataset`,
    addDataset
  )

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  const onSubmit = async (data: SchemaProps) => {
    try {
      const json = await trigger(data)
      setOpen(false)
      router.refresh()
      router.push(`/dataset/${json?.datasetId}`)
      console.log('add dataset success', json)
    } catch (error) {
      console.log('add dataset error', error)
    }
  }

  const handleCancel = (open = false) => {
    if (!isMutating) {
      setOpen(open)
      form.reset()
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={(open) => open && setOpen(true)}>
      <AlertDialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Dataset
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[488px]">
        <AlertDialogHeader>
          <AlertDialogTitle> Create Dataset</AlertDialogTitle>
        </AlertDialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex">
                    Dataset Name <div className="text-red-500">*</div>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Give your Dataset a name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="reset"
                variant="outline"
                disabled={isMutating}
                onClick={() => handleCancel(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? 'Creating' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CreateDialog
