import { format } from 'date-fns'
import { z } from 'zod'

export const FormSchema = z.object({
  name: z
    .string()
    .nonempty('Dataset name is required.')
    .max(50, { message: 'Dataset name must be less than 50 characters.' }),
  embeddingType: z.string().optional(),
  storeType: z.string().optional(),
  collectionName: z.string().optional(),
  chromaUrl: z.string().optional(),
  apiKey: z.string().optional(),
  instanceName: z.string().optional(),
  developmentName: z.string().optional(),
  apiVersion: z.string().optional(),
})

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
  type: string
  url: string
  icon?: string
  characters?: number
  config?: DataConfigProps
}

export const DataSchema = z.object({
  dataConfig: z.object({
    loaderType: z.string().optional(),
    splitType: z.string().optional(),
    chunkSize: z.number().optional(),
    chunkOverlap: z.number().optional(),
    files: z.array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        uid: z.string(),
        config: z
          .object({
            loaderType: z.string().optional(),
            splitType: z.string().optional(),
            chunkSize: z.number().optional(),
            chunkOverlap: z.number().optional(),
          })
          .optional(),
      })
    ),
    notedData: z.array(
      z.object({
        name: z.string(),
        icon: z.string(),
        id: z.string(),
        config: z
          .object({
            loaderType: z.string().optional(),
            splitType: z.string().optional(),
            chunkSize: z.number().optional(),
            chunkOverlap: z.number().optional(),
          })
          .optional(),
      })
    ),
  }),
})

export type DataSchemeProps = z.infer<typeof DataSchema>

export function formateNumber(characters: number) {
  const formatter = new Intl.NumberFormat('en', {
    notation: 'compact',
  })
  return formatter.format(characters)
}

export function formateDate(time: Date) {
  return format(new Date(`${time || 0}`), 'MM/dd/yyyy hh:mm aa')
}

export function formateIndex(index: number) {
  if (index < 10) {
    return `#00${index}`
  }
  if (index > 10 && index < 100) {
    return `#0${index}`
  } else {
    return `#${index}`
  }
}

export function formateStatus(status: number) {
  const text = status === 0 ? 'Available' : status === 1 ? 'Indexing' : 'Error'
  const color =
    status === 0
      ? 'text-green-600'
      : status === 2
      ? 'text-red-600'
      : 'text-black'
  return { color, text }
}
