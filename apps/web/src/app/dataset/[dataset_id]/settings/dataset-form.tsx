import { RefObject, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, UseFormReturn } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'
import { useDebounce } from 'usehooks-ts'

import { fetcher } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { UploadFile } from '@/components/upload/type'

import DocumentLoader, { FileProps, stringUrlToFile } from './document-loader'
import { SchemaProps } from './setting-page'
import TextSplits from './splitter'
import TextEmbedding from './text-embedding'
import VectorStores from './vector-stores'

interface IProps {
  datasetId?: string
  showMore?: boolean
  files?: FileProps[]
  defaultValues: SchemaProps
  form: UseFormReturn<any>
  setShowMore?: (s: boolean) => void
  scrollRef: RefObject<HTMLDivElement>
  sectionRefs: RefObject<HTMLDivElement>[]
}

function editDataset(url: string, { arg }: { arg: SchemaProps }) {
  return fetcher(url, {
    method: 'PATCH',
    body: JSON.stringify(arg),
  })
}

const DatasetForm = ({
  datasetId,
  form,
  defaultValues,
  setShowMore,
  showMore,
  scrollRef,
  sectionRefs,
  files,
}: IProps) => {
  const uploadFiles = useMemo(() => {
    return files
      ? files.reduce((m: UploadFile<any>[], item: FileProps) => {
          const file = stringUrlToFile(item)
          m?.push(file)
          return m
        }, [])
      : []
  }, [files])

  const [data, setData] = useState<UploadFile<any>[]>(uploadFiles)
  const { watch, handleSubmit } = form
  const current = watch()
  const { trigger } = useSWRMutation(`/api/datasets/${datasetId}`, editDataset)

  const onSubmit = useCallback(async (data: SchemaProps) => {
    console.log('--submit')
    // try {
    //   const json = await trigger(data)
    //   console.log(`edit Dataset onSubmit json:`, json)
    // } catch (error) {
    //   console.log('edit dataset error', error)
    // }
  }, [])

  const checkFiles = useMemo(() => {
    const files = current?.files
    const origin = defaultValues?.files
    if (files?.length !== origin?.length) {
      return true
    }
    files?.forEach((item: FileProps) => {
      const index = origin?.findIndex((m: FileProps) => m?.url === item?.url)
      if (index === -1) {
        return true
      }
    })
    return false
  }, [defaultValues?.files, current])

  const checkIsUpdate = useMemo(() => {
    if (checkFiles) {
      console.log('--step1')
      return true
    }
    for (let k in current) {
      // @ts-ignore
      if (k !== 'files' && current?.[k] !== defaultValues?.[k]) {
        console.log('--step2')
        return true
      }
    }
    return false
  }, [checkFiles, defaultValues, current])

  const isUpdate = useDebounce(checkIsUpdate, 1000)

  useEffect(() => {
    if (isUpdate) {
      handleSubmit(onSubmit)()
    } else {
      return
    }
  }, [isUpdate, onSubmit, handleSubmit])
  return (
    <div
      className="h-full w-full overflow-auto px-14 pb-[100px] pt-12"
      ref={scrollRef}
    >
      <div className="sm:w-full md:max-w-[600px]">
        <Form {...form}>
          <form className="w-full">
            <section
              id="dataset-name"
              ref={sectionRefs[0]}
              className="border-b-[1px] py-6"
            >
              <div className="mb-6 text-2xl font-semibold leading-8">
                Dataset Name
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-[332px]">
                    <FormLabel className="flex">
                      Dataset Name <div className="text-red-500">*</div>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Input your dataset name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
            <DocumentLoader
              form={form}
              sectionRef={sectionRefs[1]}
              data={data}
              setData={setData}
            />
            {showMore ? (
              <>
                <TextSplits form={form} sectionRef={sectionRefs[2]} />
                <TextEmbedding form={form} sectionRef={sectionRefs[3]} />
                <VectorStores form={form} sectionRef={sectionRefs[4]} />
              </>
            ) : (
              <div className="flex w-full justify-center py-6">
                <div
                  className="cursor-pointer rounded-md border px-4 py-1	"
                  onClick={() => {
                    setShowMore?.(true)
                  }}
                >
                  Show more options
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  )
}
export default DatasetForm
