'use client'

import { omit } from 'lodash'
import { nanoid } from 'nanoid'

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { UploadFileStatus } from '@/components/upload/type'
import Upload from '@/components/upload/upload'
import { FileProps } from '@/components/upload/utils'

import { DataBaseProps } from '../../../type'
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
  apps?: DataBaseProps[]
  setData: (data: FileProps[]) => void
  setUploading?: (s: boolean) => void
}

const DocumentLoader = ({ form, setData, data, setUploading }: IProps) => {
  const { isAdd } = useDataContext()
  const { watch, getValues } = form
  const onChangeFileList = (values: FileProps[]) => {
    setData([...values])
    const files = values?.reduce((m: any, item) => {
      m.push(item)
      return m
    }, [])
    form.setValue('files', [...files])
  }
  const type = watch()?.loaderType

  const files = watch().files?.filter((item: any) => item?.type === 'pdf')
  const showButton = (files?.length === 0 && !isAdd) || isAdd
  return (
    <section id="loaders" className="w-full py-6">
      <div className="mb-6 text-sm font-normal leading-6 text-slate-600">
        Use document loaders to load data from a source as documents. A Document
        is a piece of text and associated metadata. For example, there are
        document loaders for loading a simple .txt file, for loading the text
        contents of any web page, or even for loading a transcript of a YouTube
        video.
      </div>
      <SearchSelect
        form={form}
        values={types}
        name="loaderType"
        label={
          <div className="flex">
            Data Source<div className="text-red-500">*</div>
          </div>
        }
        title="Document Loader"
      />
      <FormField
        control={form.control}
        name="files"
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
