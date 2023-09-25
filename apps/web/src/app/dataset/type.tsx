import { z } from 'zod'

import { DataSchema, FormSchema } from './[dataset_id]/settings/documents/utils'

export interface DataBaseProps {
  uid: string
  name: string
  type: 'pdf' | 'annotated_data'
  status: 0 | 1 | 2
  characters?: number
  updated_at?: Date
}

interface AnnotatedProps {
  short_id?: string
  icon?: string
}

export type NotedDataProps = DataBaseProps & AnnotatedProps

export type SchemaProps = z.infer<typeof FormSchema>

export interface DataConfigProps {
  splitType?: string
  chunkSize?: number
  chunkOverlap?: number
}

export type DataSchemeProps = z.infer<typeof DataSchema>

export type FileProps = DataBaseProps & DataConfigProps

export type DataProps = FileProps | NotedDataProps

export interface AppInfoProps {
  uid: string
  icon?: string
  name: string
  short_id: string
}
