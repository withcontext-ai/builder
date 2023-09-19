'use client'

import { useState } from 'react'
import { omit } from 'lodash'
import { Plus } from 'lucide-react'
import { nanoid } from 'nanoid'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { UploadFileStatus } from '@/components/upload/type'
import Upload from '@/components/upload/upload'
import { FileProps } from '@/components/upload/utils'

import { NotedDataProps } from '../../../type'
import SearchSelect from '../../settings/documents/search-select'
import { useDataContext } from './data-context'
import AddAnnotatedData from './noted-data-alert'
import { SessionProps } from './splitter'

const types = [
  { label: 'PDF loader', value: 'pdf' },
  { label: 'Annotated data', value: 'annotated_data' },
  { label: 'More Coming Soon...', value: 'coming soon' },
]

export const stringUrlToFile = (file: FileProps) => {
  const status: UploadFileStatus = 'success'
  return {
    url: file?.url || '',
    name: file?.name || '',
    uid: nanoid(),
    status,
  }
}

interface IProps extends SessionProps {
  data: FileProps[]
  apps?: NotedDataProps[]
  setData: (data: FileProps[]) => void
  setUploading?: (s: boolean) => void
}

const DocumentLoader = ({ form, setData, data, setUploading }: IProps) => {
  const { isAdd } = useDataContext()
  const { watch, getValues } = form
  const onChangeFileList = (values: FileProps[]) => {
    setData([...values])
    const config = omit(getValues().dataConfig, ['files', 'notedData'])
    const files = values?.reduce((m: any, item) => {
      const fileConfig = { ...config, ...item }
      m.push(fileConfig)
      return m
    }, [])
    form.setValue('dataConfig.files', [...files])
  }
  const type = watch()?.dataConfig?.loaderType

  const files = watch()?.dataConfig.files?.filter(
    (item: any) => item?.type === 'pdf'
  )
  const showButton = (files?.length === 0 && !isAdd) || isAdd

  return (
    <section id="loaders" className="w-full py-6">
      <div className="mb-6 text-2xl font-semibold leading-8">
        Document Loaders
      </div>
      <div className="mb-6 text-sm font-normal leading-6 text-slate-600">
        Use document loaders to load data from a source as Document&apos;s. A
        Document is a piece of text and associated metadata. For example, there
        are document loaders for loading a simple .txt file, for loading the
        text contents of any web page, or even for loading a transcript of a
        YouTube video.
      </div>
      <SearchSelect
        form={form}
        values={types}
        name="dataConfig.loaderType"
        label={
          <div className="flex">
            Data Source<div className="text-red-500">*</div>
          </div>
        }
        title="Document Loader"
      />
      <FormField
        control={form.control}
        name="dataConfig.files"
        render={(field) => {
          return (
            <FormItem className="w-[332px]">
              <FormControl>
                {type === 'pdf' ? (
                  <Upload
                    className="items-start justify-start"
                    listProps={{
                      showDownloadIcon: false,
                      showPreviewIcon: false,
                    }}
                    setUploading={setUploading}
                    listType={!showButton ? 'update-pdf' : 'pdf'}
                    type="drag"
                    fileType={type}
                    accept="application/pdf"
                    fileList={data}
                    onChangeFileList={onChangeFileList}
                  />
                ) : (
                  <AddAnnotatedData form={form} />
                )}
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
