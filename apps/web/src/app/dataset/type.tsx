import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { FileProps } from '@/components/upload/utils'

import { DataSchema, FormSchema } from './[dataset_id]/settings/documents/utils'

export type LoaderTypeProps = 'pdf' | 'annotated_data'

export type DataBaseProps = {
  type: LoaderTypeProps
  short_id?: string
  uid: string
  icon?: string
  name: string
}

export type DocumentProps = DataBaseProps & {
  status: 0 | 1 | 2
  characters?: number
  updated_at: Date
  url: string
}

export type FileSplitConfigProps = {
  splitType: string
  chunkSize: number
  chunkOverlap: number
}

export type DocumentParamsType = {
  uid: string
  url: string
  type: string
  split_option: {
    split_type: string
    chunk_size: number
    chunk_overlap: number
  }
}

export type SchemaProps = z.infer<typeof FormSchema>

export type DataSchemeProps = z.infer<typeof DataSchema>

export type DataProps = DocumentProps & FileSplitConfigProps
export type SegmentProps = {
  content: string
  index?: string
  segment_id?: string
}

export type SessionProps = {
  form: UseFormReturn<any>
  files?: FileProps[]
}
