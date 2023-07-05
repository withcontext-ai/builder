'use client'

import { RefObject, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { difference, differenceBy } from 'lodash'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import DatasetForm from './dataset-form'
import SlideBar from './slidebar'

export interface SectionType {
  ref?: RefObject<HTMLElement>
  title: string
  name: string
}

export const FormSchema = z.object({
  name: z
    .string()
    .nonempty('Dataset name is required.')
    .max(50, { message: 'Dataset name must be less than 50 characters.' }),
  loaderType: z.string().optional(),
  splitType: z.string().optional(),
  embeddingTyp: z.string().optional(),
  files: z.array(z.string()).optional(),
  chunkSize: z.number(),
  chunkOverlap: z.number(),
  storeType: z.string(),
  collectionName: z.string().optional(),
  chromaUrl: z.string().optional(),
  apiKey: z.string().optional(),
  instanceName: z.string().optional(),
  developmentName: z.string().optional(),
  apiVersion: z.string().optional(),
  retrieversType: z.string(),
  promptName: z.string().optional(),
  promptDesc: z.string().optional(),
  promptMsg: z.string().optional(),
})

const DatasetSetting = () => {
  const [selected, setSelected] = useState<string>('#dataset-name')
  const [error, setError] = useState<string>('')
  const [saved, setSaved] = useState<boolean>(false)
  const router = useRouter()

  const defaultValues = useMemo(
    () => ({
      name: '',
      loaderType: 'pdf loader',
      splitType: 'character textsplitter',
      files: [],
      chunkSize: 1000,
      chunkOverlap: 1000,
      embeddingType: 'openAI embedding',
      storeType: 'pinecone',
      collectionName: '',
      chromaUrl: '',
      apiKey: '',
      instanceName: '',
      developmentName: '',
      apiVersion: '',
      retrieversType: 'vectorStoreRetriever',
      promptName: '',
      promptDesc: '',
      promptMsg: '',
    }),
    []
  )

  const checkIsUpdate = () => {
    const current = form.getValues()
    if (difference(current?.files, defaultValues?.files)?.length) {
      return true
    }
    for (let k in current) {
      // @ts-ignore
      if (k !== 'files' && current?.[k] !== defaultValues?.[k]) {
        return true
      }
    }
    return false
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  const handleGoBack = () => {
    const update = checkIsUpdate()
    console.log(update, '---update')
    if (!saved && update) {
      setError('Your changes have not been published yet!')
    } else {
      router.back()
    }
  }

  const handleSelected = (cur: string) => {
    setSelected(cur)
  }
  return (
    <div className="fixed inset-0 flex h-full w-full bg-white">
      <div className="w-[276px] border-r border-slate-200 bg-slate-50">
        <SlideBar
          handleGoBack={handleGoBack}
          handleSelected={handleSelected}
          selected={selected}
        />
      </div>
      <DatasetForm
        setSelected={setSelected}
        error={error}
        setError={setError}
        setSaved={setSaved}
        form={form}
      />
    </div>
  )
}

export default DatasetSetting
