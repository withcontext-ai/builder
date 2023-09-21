import { z } from 'zod'

import { DataSchema, FormSchema } from './[dataset_id]/settings/documents/utils'

export interface NotedDataProps {
  name?: string
  short_id?: string
  updated_at?: Date
  icon?: string
  uid?: string
  characters?: number
  status?: number
  type?: string
}

export type SchemaProps = z.infer<typeof FormSchema>

export interface DataConfigProps {
  type?: string
  splitType?: string
  chunkSize?: number
  chunkOverlap?: number
  uid: string
  name: string
}

export interface DataProps {
  uid: string
  name: string
  status?: number
  short_id?: string
  type: string
  url: string
  icon?: string
  characters?: number
  config?: DataConfigProps
  updated_at?: Date
}

export type DataSchemeProps = z.infer<typeof DataSchema>
