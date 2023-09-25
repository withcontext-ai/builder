import { z } from 'zod'

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

export type FileProps = DataBaseProps & DataConfigProps

export type DataProps = FileProps | DataBaseProps

export interface AppInfoProps {
  uid: string
  icon?: string
  name: string
  short_id: string
}
