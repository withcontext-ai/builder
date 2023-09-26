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

const FileSchema = z.array(
  z.object({
    name: z.string(),
    url: z.string().optional(), //pdf
    type: z.string(),
    uid: z.string(),
    short_id: z.string().optional(), //noted data
    loaderType: z.string().optional(),
    splitType: z.string().optional(),
    chunkSize: z.number().optional(),
    chunkOverlap: z.number().optional(),
    status: z.number().optional(), //0:indexed  1:indexing 2:error
    characters: z.number().optional(),
  })
)

export const DataSchema = z.object({
  loaderType: z.string().optional(),
  splitType: z.string().optional(),
  chunkSize: z.number().optional(),
  chunkOverlap: z.number().optional(),
  files: FileSchema,
  notedData: FileSchema,
})

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
