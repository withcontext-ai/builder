'use client'

import { RefObject, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { difference } from 'lodash'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import DatasetForm from './dataset-form'
import SlideBar from './slidebar'

export interface SectionType {
  ref?: RefObject<HTMLElement>
  title: string
  name: string
}

const FormSchema = z.object({
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
})

export type SchameProps = z.infer<typeof FormSchema>

const DatasetSetting = () => {
  const [selected, setSelected] = useState<string>('dataset-name')
  const navRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<RefObject<HTMLElement>[]>([])

  const [error, setError] = useState<string>('')
  const [saved, setSaved] = useState<boolean>(false)
  const router = useRouter()
  const [showMore, setShowMore] = useState<boolean>(false)
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
    if (!saved && update) {
      setError('Your changes have not been published yet!')
    } else {
      router.back()
    }
  }

  return (
    <div className="absolute inset-0 flex h-full w-full bg-white">
      <div className="w-[276px] border-r border-slate-200 bg-slate-50">
        <SlideBar
          handleGoBack={handleGoBack}
          setSelect={setSelected}
          selected={selected}
          showMore={showMore}
          navRef={navRef}
          scrollRef={scrollRef}
        />
      </div>
      <DatasetForm
        showMore={showMore}
        setSelected={setSelected}
        error={error}
        setError={setError}
        setSaved={setSaved}
        form={form}
        navRef={navRef}
        scrollRef={scrollRef}
        setShowMore={setShowMore}
      />
    </div>
  )
}

export default DatasetSetting
