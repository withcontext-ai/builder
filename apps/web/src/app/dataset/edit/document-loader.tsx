'use client'

import { RefObject, useState } from 'react'
import { FormProps, UseFormReturn } from 'react-hook-form'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { UploadFile } from '@/components/upload/type'
import Upload from '@/components/upload/upload'

import SearchSelect from './search-select'

interface IProps {
  ref?: RefObject<HTMLElement>
  form: UseFormReturn
}
const types = [
  { label: 'Pdf loader', value: 'pdf loader' },
  { label: 'Comming soon...', value: 'comming soon' },
] as const

const DocumentLoader = ({ ref, form }: IProps) => {
  const [data, setData] = useState<UploadFile[]>([])
  const [files, setFiles] = useState<string[]>([])
  const handleFiles = (values: UploadFile[]) => {
    setData([...values])
    const success = values
      ?.filter((item) => item?.url && item?.status === 'success')
      ?.reduce((m, file) => {
        // @ts-ignore
        m.push(file?.url || '')
        return m
      }, [])
    setFiles([...files, ...success])
  }

  const handleRemove = (file: UploadFile) => {
    const newData = data?.filter((item) => item?.uid !== file?.uid)
    setData([...newData])
  }
  return (
    <section id="loaders" className="w-full" ref={ref}>
      <div className="mb-6 text-2xl font-semibold leading-8">
        Document Loaders
      </div>
      <div className="mb-6	text-sm font-normal leading-6 text-slate-600">
        Use document loaders to load data from a source as Document&apos;s. A
        Document is a piece of text and associated metadata. For example, there
        are document loaders for loading a simple .txt file, for loading the
        text contents of any web page, or even for loading a transcript of a
        YouTube video.
      </div>
      <SearchSelect
        form={form}
        values={types}
        name="loaderType"
        title="Document Loader"
      />
      <FormField
        control={form.control}
        name="files"
        render={(field) => {
          return (
            <FormItem>
              <FormLabel>Files</FormLabel>
              <FormControl>
                <Upload
                  className="items-start justify-start"
                  showUploadList={{
                    showDownloadIcon: false,
                    showPreviewIcon: false,
                  }}
                  onRemove={handleRemove}
                  listType="pdf"
                  accept="application/pdf"
                  fileList={data}
                  handleFiles={handleFiles}
                  customRequest={() => {}}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </section>
  )
}

export default DocumentLoader
