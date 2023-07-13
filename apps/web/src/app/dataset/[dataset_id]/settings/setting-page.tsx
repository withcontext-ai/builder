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

  const [showMore, setShowMore] = useState<boolean>(false)
  const defaultValues = useMemo(() => ({ name, ...config }), [config, name])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  })

  return (
    <div className="absolute inset-0 flex h-full w-full bg-white">
      <div className="w-[276px] border-r border-slate-200 bg-slate-50">
        <SlideBar
          showMore={showMore}
          scrollRef={scrollRef}
          datasetId={datasetId}
          activeSection={activeSection}
        />
      </div>
      <DatasetForm
        datasetId={datasetId}
        showMore={showMore}
        form={form}
        defaultValues={defaultValues}
        files={config?.files}
        setShowMore={setShowMore}
        scrollRef={scrollRef}
        sectionRefs={sectionRefs}
      />
    </div>
  )
}

export default DatasetSetting
