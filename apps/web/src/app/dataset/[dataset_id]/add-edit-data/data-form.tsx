'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { z } from 'zod'

import { fetcher } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { FileProps } from '@/components/upload/utils'

import DocumentLoader, {
  stringUrlToFile,
} from '../add-edit-data/document-loader'
import { FormSchema, SchemaProps } from '../data/utils'
import TextSplits from './splitter'

export interface FormProps {
  datasetId?: string
  config?: any
  active: number
  setActive: (s: number) => void
  setUploading?: (s: boolean) => void
}

type Params = SchemaProps

function editDataset(
  url: string,
  { arg }: { arg: { name: string; config: Omit<Params, 'name'> } }
) {
  return fetcher(url, {
    method: 'PATCH',
    body: JSON.stringify(arg),
  })
}

const DataForm = ({ datasetId, config, active, setActive }: FormProps) => {
  const uploadFiles = useMemo(() => {
    const files = config?.files
    return files
      ? files.reduce((m: FileProps[], item: FileProps) => {
          const file = stringUrlToFile(item)
          m?.push(file)
          return m
        }, [])
      : []
  }, [config?.files])

  const [data, setData] = useState<FileProps[]>(uploadFiles)
  const [values, setValues] = useState<SchemaProps>(config)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values,
  })

  const { handleSubmit, watch } = form
  const { trigger } = useSWRMutation(`/api/datasets/${datasetId}`, editDataset)
  const router = useRouter()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formValue = useMemo(() => watch(), [JSON.stringify(watch())])
  const onSubmit = async (data: SchemaProps) => {
    try {
      const { name, ...rest } = data
      const json = await trigger({ name, config: rest })
      setValues({ name: json.body?.name, ...json?.body?.config })
      router.refresh()
    } catch (error) {}
  }

  const handleClick = () => {
    if (active < 3) {
      setActive(active + 1)
    }
  }

  return (
    <div className="h-full w-full px-14">
      <div className="sm:w-full md:max-w-[600px]">
        <Form {...form}>
          <form className="w-full">
            {active === 1 && (
              <DocumentLoader form={form} data={data} setData={setData} />
            )}
            {active === 2 && <TextSplits form={form} />}
          </form>
        </Form>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleClick}>
            {active !== 3 ? 'Next' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
export default DataForm
