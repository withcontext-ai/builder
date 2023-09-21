import 'server-only'

import { redirect } from 'next/navigation'
import { Item } from '@radix-ui/react-dropdown-menu'
import axios from 'axios'
import { and, desc, eq, sql } from 'drizzle-orm'
import { isEqual, omit, pick } from 'lodash'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle-edge'
import { flags } from '@/lib/flags'
import { nanoid } from '@/lib/utils'
import { FileProps } from '@/components/upload/utils'
import { DataProps, NotedDataProps } from '@/app/dataset/type'

import { AppsDatasetsTable } from '../apps_datasets/schema'
import { getApps } from '../apps/actions'
import { NewApp } from '../apps/schema'
import { DatasetsTable, NewDataset } from './schema'

export async function addDataset(
  dataset: Omit<NewDataset, 'short_id' | 'created_by'>
) {
  const { userId } = auth()
  if (!userId) return null
  const { name } = dataset

  let api_dataset_id = null
  if (flags.enabledAIService) {
    const { data: res } = await axios.post(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets`,
      {
        name,
      }
    )
    if (res.status !== 200) {
      return null
    }
    api_dataset_id = res?.data?.id
  }

  const config = omit(dataset, 'name')
  const data = {
    name,
    short_id: nanoid(),
    created_by: userId,
    api_dataset_id,
    config,
  }
  const newDataset = await db.insert(DatasetsTable).values(data).returning()

  const datasetId = newDataset[0]?.short_id
  return { datasetId, name: newDataset[0].name }
}

export async function getDatasets() {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])

  return db
    .select({
      short_id: DatasetsTable.short_id,
      name: DatasetsTable.name,
      config: DatasetsTable.config,
      api_dataset_id: DatasetsTable.api_dataset_id,
      status: DatasetsTable.status,
      linked_app_count: sql`count(${AppsDatasetsTable.app_id})`,
    })
    .from(DatasetsTable)
    .orderBy(desc(DatasetsTable.created_at))
    .where(
      and(
        eq(DatasetsTable.created_by, userId),
        eq(DatasetsTable.archived, false)
      )
    )
    .leftJoin(
      AppsDatasetsTable,
      eq(AppsDatasetsTable.dataset_id, DatasetsTable.short_id)
    )
    .groupBy(DatasetsTable.id)
}

export async function getDataset(datasetId: string) {
  try {
    const [item] = await db
      .select()
      .from(DatasetsTable)
      .where(eq(DatasetsTable.short_id, datasetId))
      .limit(1)

    if (!item) {
      throw new Error('Dataset not found')
    }

    return item
  } catch (error) {
    redirect('/')
  }
}

export async function getEditParams(
  datasetId: string,
  newValue: Partial<NewDataset>
) {
  const { config } = newValue
  let editParams = {}
  let api_dataset_id = ''
  if (flags.enabledAIService) {
    const dataset = await getDataset(datasetId)
    api_dataset_id = dataset?.api_dataset_id
    if (!api_dataset_id) return Promise.resolve({ api_dataset_id, editParams })
    const oldFiles = (dataset?.config as any)?.files
    const newFiles = (config as any)?.files
    const update = !isEqual(oldFiles, newFiles)
    if (update) {
      const documents = newFiles?.reduce(
        (m: Record<string, any>[], item: any) => {
          if (item?.type === 'annotated_data') {
            item.url = ''
          }
          const cur = pick(item, ['url', 'type', 'uid'])
          const split_option = {
            split_type: item?.splitType,
            chunk_size: item?.chunkSize,
            chunk_overlap: item?.chunkOverlap,
          }
          // @ts-ignore
          cur.split_option = split_option
          m.push(cur)
          return m
        },
        []
      )
      editParams = { documents }
    }
  }
  return Promise.resolve({ editParams, api_dataset_id })
}

export async function editDataset(
  datasetId: string,
  newValue: Partial<NewDataset>,
  documents?: DataProps[]
) {
  const { name, config = {} } = newValue
  let newConfig = config
  if (documents) {
    // @ts-ignore
    newConfig = { ...config, files: documents }
  }
  const { userId } = auth()
  if (!userId) return Promise.resolve([])
  const { api_dataset_id, editParams } = await getEditParams(
    datasetId,
    newValue
  )
  if (api_dataset_id && editParams) {
    let { data: res } = await axios.patch(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}`,
      editParams
    )
    if (res.status !== 200) {
      return
    }
  }

  const response = await db
    .update(DatasetsTable)
    .set({ name, config: newConfig, updated_at: new Date() })
    .where(
      and(
        eq(DatasetsTable.short_id, datasetId),
        eq(DatasetsTable.created_by, userId)
      )
    )

  return response
}

export async function removeDataset(datasetId: string) {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])

  let api_dataset_id = null
  if (flags.enabledAIService) {
    const dataset = await getDataset(datasetId)
    api_dataset_id = dataset?.api_dataset_id
    if (!api_dataset_id) return Promise.resolve([])

    const { data: res } = await axios.delete(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}`
    )
    if (res?.status !== 200) {
      return Promise.resolve([])
    }
  }

  const response = await db
    .update(DatasetsTable)
    .set({ archived: true, updated_at: new Date() })
    .where(
      and(
        eq(DatasetsTable.short_id, datasetId),
        eq(DatasetsTable.created_by, userId)
      )
    )

  return response
}
