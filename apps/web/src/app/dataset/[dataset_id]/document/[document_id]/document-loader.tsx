'use client'

import { useMemo } from 'react'

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import Upload from '@/components/upload/upload'
import { FileProps } from '@/components/upload/utils'

import { DocumentProps, SessionProps } from '../../../type'
import SearchSelect from '../../settings/documents/search-select'
import { useDataContext } from './data-context'
import AddAnnotatedData from './noted-data-alert'

const types = [
  { label: 'PDF loader', value: 'pdf' },
  { label: 'Microsoft Word Loader', value: 'word' },
  { label: 'Annotated data', value: 'annotated_data' },
  { label: 'More Coming Soon...', value: 'coming soon' },
]
interface IProps extends SessionProps {
  apps?: DocumentProps[]
}

const DocumentLoader = ({ form }: IProps) => {
  const { isAdd } = useDataContext()

  const { getValues, setValue } = form
  const files = getValues()?.files
  const onChangeFileList = (values: FileProps[]) => {
    setValue('files', [...values])
  }
  const formValues = getValues()
  const loaderType = formValues?.loaderType
  const isNotedData = loaderType === 'annotated_data'

  const showButton = useMemo(() => {
    const files = formValues.files?.filter(
      (item: any) => item?.type !== 'annotated_data'
    )
    return (files?.length === 0 && !isAdd) || isAdd
  }, [formValues.files, isAdd])

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
                {!isNotedData ? (
                  <Upload
                    className="items-start justify-start"
                    listProps={{
                      showDownloadIcon: false,
                      showPreviewIcon: false,
                    }}
                    listType={showButton ? 'files' : 'update-file'}
                    type="drag"
                    fileType={loaderType}
                    accept={
                      loaderType === 'pdf' ? 'application/pdf' : '.doc, .docx'
                    }
                    fileList={files}
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
