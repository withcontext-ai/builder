'use client'

import { RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'

import useScrollSpy from '@/hooks/use-scroll-spy'

import DatasetForm from '../basics/basic-form'
import SlideBar from '../sidebar'
import { FormSchema } from './utils'

export interface SectionType {
  ref?: RefObject<HTMLElement>
  title: string
  name: string
}

export type SchemaProps = z.infer<typeof FormSchema>

const DatasetSetting = ({
  name = '',
  config = {},
  datasetId,
}: {
  name?: string
  config?: Record<string, any>
  datasetId?: string
}) => {
  const defaultValues = useMemo(() => {
    // some loaderType is pdf loader .now change to pdf
    config.loaderType = config?.loaderType?.includes('pdf')
      ? 'pdf'
      : config.loaderType
    config.splitType = config?.splitType?.includes('character')
      ? 'character'
      : config?.splitType
    config.embeddingType = config?.embeddingType?.includes('openAI')
      ? 'openAI'
      : config.embeddingType
    return { name, ...config }
  }, [config, name])

  return (
    <div className="absolute inset-0 hidden h-full w-full bg-white lg:flex">
      <div className="w-[276px] border-r border-slate-200 bg-slate-50">
        <SlideBar datasetId={datasetId} name={name} />
      </div>
      {/* <DatasetForm
        datasetId={datasetId}
        defaultValues={defaultValues}
        files={config?.files}
      /> */}
    </div>
  )
}

export default DatasetSetting
