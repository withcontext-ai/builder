import 'server-only'

import { redirect } from 'next/navigation'
import axios from 'axios'
import { and, desc, eq, sql } from 'drizzle-orm'
import { omit, pick } from 'lodash'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle-edge'
import { flags } from '@/lib/flags'
import { nanoid } from '@/lib/utils'
import {
  DataProps,
  DataSchemeProps,
  DocumentParamsType,
} from '@/app/dataset/type'

import { AppsDatasetsTable } from '../apps_datasets/schema'
import { DatasetsTable, NewDataset } from './schema'

export async function addDataset(
  dataset: Omit<NewDataset, 'short_id' | 'created_by'>
) {
  const { userId } = auth()
  if (!userId) return null
  const { name } = dataset

  let api_dataset_id = null
  if (flags.enabledAIService) {
    const res = await fetch(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ name }),
      }
    ).then((res) => res.json())
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
  const config = newValue?.config as DataSchemeProps
  let editParams = {}
  let api_dataset_id = ''
  if (flags.enabledAIService) {
    const dataset = await getDataset(datasetId)
    api_dataset_id = dataset?.api_dataset_id
    if (!api_dataset_id) return Promise.resolve({ api_dataset_id, editParams })
    const newFiles = (config as DataSchemeProps)?.files

    const documents = newFiles?.reduce(
      // @ts-ignore
      (m: DocumentParamsType[], item: DataProps) => {
        if (item?.type === 'annotated_data') {
          item.url = ''
        }
        const splitConfig = {
          split_type: item?.splitType || 'character',
          chunk_size: item?.chunkSize || 500,
          chunk_overlap: item?.chunkOverlap || 0,
        }
        const cur = pick(item, ['url', 'type', 'uid'])

        m.push({ ...cur, split_option: splitConfig })
        return m
      },
      []
    )
    editParams = { documents }
  }
  return Promise.resolve({ editParams, api_dataset_id })
}

export async function editDataset(
  datasetId: string,
  newValue: Partial<NewDataset>
) {
  const { name, config = {} } = newValue

  const { userId } = auth()
  if (!userId) return Promise.resolve([])
  const { api_dataset_id, editParams } = await getEditParams(
    datasetId,
    newValue
  )
  if (api_dataset_id && editParams) {
    await fetch(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify(editParams),
      }
    ).then((res) => res.json())
  }

  const response = await db
    .update(DatasetsTable)
    .set({ name, config, updated_at: new Date() })
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

    await fetch(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'DELETE',
      }
    ).then((res) => res.json())
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
