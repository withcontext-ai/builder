import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { FileProps } from '@/components/upload/utils'

import { DataSchema, FormSchema } from './[dataset_id]/settings/documents/utils'

export interface DataBaseProps {
  uid: string
  name: string
  type?: 'pdf' | 'annotated_data'
  status?: 0 | 1 | 2
  characters?: number
  updated_at?: Date
  url?: string
  short_id?: string
  icon?: string
}

export interface DataConfigProps {
  config?: {
    splitType?: string
    chunkSize?: number
    chunkOverlap?: number
  }
}

export type SchemaProps = z.infer<typeof FormSchema>

export type DataSchemeProps = z.infer<typeof DataSchema>

export type DataProps = DataBaseProps & DataConfigProps

export interface SegmentProps {
  content: string
  segment_id?: string
  index?: string
}

export interface SessionProps {
  form: UseFormReturn<any>
  files?: FileProps[]
}
