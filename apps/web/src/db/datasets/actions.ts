import 'server-only'

import { and, desc, eq } from 'drizzle-orm'
import { omit } from 'lodash'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle'
import { nanoid } from '@/lib/utils'

import { AppsTable } from '../apps/schema'
import { DatasetsTable, NewDataset } from './schema'

export async function addDataset(
  dataset: Omit<NewDataset, 'short_id' | 'created_by'>
) {
  const { userId } = auth()
  if (!userId) return null
  const data = {
    name: dataset?.name,
    short_id: nanoid(),
    created_by: userId,
    user_id: userId,
  }
  const config = omit(dataset, 'name')
  console.log('---db', { ...data, config })
  const newDataset = await db
    .insert(DatasetsTable)
    .values({ ...data, config })
    .returning()
  const datasetId = newDataset[0]?.short_id
  return { datasetId, name: newDataset[0].name }
}

export async function getDatasets() {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])
  const data = db
    .select()
    .from(DatasetsTable)
    .orderBy(desc(DatasetsTable.created_at))
    .where(and(eq(DatasetsTable.created_by, userId)))
  console.log(data, '----data')
  return data
}

export async function getDataset(datasetId: string) {
  const items = await db
    .select()
    .from(DatasetsTable)
    .where(eq(DatasetsTable.short_id, datasetId))
  return Promise.resolve(items[0])
}

export async function editDataset(id: string, newValue: Partial<NewDataset>) {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])

  return db
    .update(DatasetsTable)
    .set(newValue)
    .where(and(eq(AppsTable.short_id, id), eq(AppsTable.created_by, userId)))
}

export async function removeDataset(id: string) {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])
  // 删除某一列数据
  return db
    .delete(DatasetsTable)
    .where(
      and(eq(DatasetsTable.short_id, id), eq(DatasetsTable.created_by, userId))
    )
}
