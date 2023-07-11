import { RefObject, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UseFormReturn } from 'react-hook-form'
import useSWRMutation from 'swr/mutation'

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

import DocumentLoader, { FileProps } from './document-loader'
import { SchemaProps } from './setting-page'
import TextSplits from './splitter'
import TextEmbedding from './text-embedding'
import VectorStores from './vector-stores'

interface IProps {
  error: string
  datasetId?: string
  showMore?: boolean
  files?: FileProps[]
  setError: (s: string) => void
  setSaved: (s: boolean) => void
  form: UseFormReturn<any>
  setShowMore?: (s: boolean) => void
  scrollRef: RefObject<HTMLDivElement>
  sectionRefs: RefObject<HTMLDivElement>[]
}

function handelDataset(url: string, { arg }: { arg: SchemaProps }) {
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
}

const DatasetForm = ({
  error,
  datasetId,
  setError,
  setSaved,
  form,
  setShowMore,
  showMore,
  scrollRef,
  sectionRefs,
  files,
}: IProps) => {
  const handelCancel = () => {
    setError('')
    form.reset()
    setCancel(true)
  }
  const { trigger, isMutating: addMutating } = useSWRMutation(
    '/api/datasets',
    handelDataset
  )
  const [cancel, setCancel] = useState(false)
  const { trigger: editTrigger, isMutating: editMutating } = useSWRMutation(
    `/api/datasets/${datasetId}`,
    handelDataset
  )
  const router = useRouter()
  const onSubmit = async (data: SchemaProps) => {
    try {
      const json = datasetId ? await editTrigger(data) : await trigger(data)
      setSaved(true)
      setError('')
      router.push('/datasets')
      console.log('add Dataset onSubmit json:', json)
    } catch (error) {
      setError(error as string)
    }
  }
  return (
    <div
      className="h-full w-full overflow-auto px-14 pb-[100px] pt-12"
      ref={scrollRef}
    >
      <div className="sm:w-full md:max-w-[600px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
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
              files={files}
              cancel={cancel}
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
            <div
              className={cn(
                'fixed bottom-6 mt-2 flex w-[600px] items-center justify-between rounded-lg border bg-white	px-4 py-2 shadow-xl',
                error ? 'bg-red-500 text-slate-100' : ''
              )}
            >
              <div className="max-w-[500px]"> {error}</div>
              <div className="flex justify-end gap-2 ">
                <Button
                  type="reset"
                  onClick={handelCancel}
                  variant="outline"
                  disabled={addMutating || editMutating}
                  className={cn(error ? 'border-none bg-red-500' : '')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={addMutating || editMutating}>
                  {addMutating || editMutating ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
export default DatasetForm
