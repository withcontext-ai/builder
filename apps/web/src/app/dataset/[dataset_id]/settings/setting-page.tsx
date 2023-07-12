'use client'

import { RefObject, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import useScrollSpy from '@/hooks/use-scroll-spy'

import DatasetForm from './dataset-form'
import { FileProps } from './document-loader'
import SlideBar from './sidebar'
import { FormSchema } from './utils'

export interface SectionType {
  ref?: RefObject<HTMLElement>
  title: string
  name: string
}

export type SchemaProps = z.infer<typeof FormSchema>

const DatasetSetting = ({
  name = '',
  config,
  datasetId,
}: {
  name?: string
  config?: Record<string, any>
  datasetId?: string
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]
  const activeSection = useScrollSpy({
    scrollingElement: scrollRef,
    sectionElementRefs: sectionRefs,
    offsetPx: -10,
  })

  const [error, setError] = useState<string>('')
  const [saved, setSaved] = useState<boolean>(false)
  const router = useRouter()
  const [showMore, setShowMore] = useState<boolean>(false)
  const defaultValues = useMemo(() => ({ name, ...config }), [config, name])

  const checkFiles = () => {
    const current = form.getValues()?.files
    // @ts-ignore
    const origin = defaultValues?.files
    if (current?.length !== origin?.length) {
      return true
    }
    current?.forEach((item) => {
      const index = origin?.findIndex((m: FileProps) => m?.url === item?.url)
      if (index === -1) {
        return true
      }
    })
    return false
  }

  const checkIsUpdate = () => {
    const current = form.getValues()
    const fileUpdate = checkFiles()
    if (fileUpdate) {
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
          showMore={showMore}
          scrollRef={scrollRef}
          datasetId={datasetId}
          activeSection={activeSection}
        />
      </div>
      <DatasetForm
        datasetId={datasetId}
        showMore={showMore}
        error={error}
        setError={setError}
        setSaved={setSaved}
        form={form}
        files={config?.files}
        setShowMore={setShowMore}
        scrollRef={scrollRef}
        sectionRefs={sectionRefs}
      />
    </div>
  )
}

export default DatasetSetting
