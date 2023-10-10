import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs'
import { and, desc, eq, ilike, inArray } from 'drizzle-orm'
import { pick } from 'lodash'
import { nanoid } from 'nanoid'

import { db } from '@/lib/drizzle-edge'
import { flags } from '@/lib/flags'
import {
  DataProps,
  DocumentParamsType,
  DocumentProps,
} from '@/app/dataset/type'

import { getApps } from '../apps/actions'
import { AppsTable, NewApp } from '../apps/schema'
import { getDataset } from '../datasets/actions'
import { DatasetsTable } from '../datasets/schema'
import { DocumentsTable, NewDocument } from './schema'

export type newDocumentParams = {
  documents: any[]
  dataset_id: string
  type?: string
  config: any
}

export type searchParams = {
  pageSize?: number
  search?: string
  pageIndex?: number
}
export type geDocumentParams = {
  params: searchParams
  dataset_id: string
}

export async function getDatasetDocument(dataset_id: string) {
  return await db
    .select()
    .from(DocumentsTable)
    .orderBy(desc(DocumentsTable.created_at))
    .where(
      and(
        eq(DocumentsTable.dataset_id, dataset_id),
        eq(DocumentsTable.archived, false)
      )
    )
}

export async function getDocumentByTable({
  dataset_id,
  params,
}: geDocumentParams) {
  const { search = '', pageSize = 10, pageIndex = 0 } = params
  const item: NewDocument[] = await db
    .select()
    .from(DocumentsTable)
    .orderBy(desc(DocumentsTable.created_at))
    .where(
      and(
        eq(DocumentsTable.dataset_id, dataset_id),
        eq(DocumentsTable.archived, false),
        ilike(DocumentsTable.name, `%${search}%`)
      )
    )
    .limit(pageSize)
    .offset(pageIndex * pageSize)

  return item
}

export async function findApps(ids: string[]) {
  return await db
    .select({
      name: AppsTable.name,
      icon: AppsTable.icon,
      uid: AppsTable.api_model_id,
      app_id: AppsTable.short_id,
    })
    .from(AppsTable)
    .where(
      and(inArray(AppsTable.api_model_id, ids), eq(AppsTable.archived, false))
    )
}

function createEmptyDocument(
  dataset_id: string,
  user_id: string,
  config?: Record<string, any>,
  attributes?: Record<string, any>
) {
  return {
    config: { splitConfig: config },
    ...attributes,
    updated_at: new Date(),
    dataset_id,
    created_by: user_id,
    short_id: nanoid(),
    status: 1,
  }
}

export async function addDocuments(data: newDocumentParams) {
  try {
    const { userId } = auth()

    if (!userId) return Promise.resolve([])
    const { type, documents: _documents, dataset_id, config } = data
    const isPdf = type === 'pdf'

    let documents = []
    if (isPdf) {
      documents = _documents?.reduce((m: DataProps[], cur: DataProps) => {
        const item = createEmptyDocument(dataset_id, userId, config, cur)
        // @ts-ignore
        m.push(item)
        return m
      }, [])
    } else {
      const ids = _documents?.map((item) => item?.uid)
      const apps = await findApps(ids)
      documents = _documents?.reduce((m: any[], cur: any, index) => {
        const attributes = { ...apps[index], type: 'annotated_data' }
        const item = createEmptyDocument(dataset_id, userId, config, attributes)
        m.push(item)
        return m
      }, [])
    }
    const queue: any[] = []

    documents?.forEach((item: NewDocument) => {
      const task = db.insert(DocumentsTable).values(item)
      queue.push(task)
    })
    await Promise.all(queue)
    return { success: true, documents }
  } catch (error) {
    console.log('error error:', error)
  }
}

export async function getDocumentDetail(id: string) {
  try {
    const { userId } = auth()
    if (!userId) return Promise.resolve([])

    // @ts-ignore
    const [item]: NewDocument = await db
      .select()
      .from(DocumentsTable)
      .where(eq(DocumentsTable.short_id, id))
      .limit(1)
    if (!item) {
      throw new Error('Document not found')
    }

    return item
  } catch (error) {
    redirect('/')
  }
}

export async function editDocument(
  short_id: string,
  document: NewDocument[],
  config: any
) {
  try {
    const { userId } = auth()
    if (!userId) return Promise.resolve([])
    const fileConfig = pick(document[0], [
      'name',
      'url',
      'icon',
      'type',
      'app_id',
    ])
    const splitConfig = { splitConfig: config }
    const response = await db
      .update(DocumentsTable)
      .set({
        updated_at: new Date(),
        ...fileConfig,
        config: splitConfig,
        status: 1,
      })
      .where(
        and(
          eq(DocumentsTable.short_id, short_id),
          eq(DocumentsTable.created_by, userId)
        )
      )
    return { data: response, success: true }
  } catch (error) {
    redirect('/')
  }
}

export async function deleteDocument(dataset_id: string, uid: string) {
  try {
    const { userId } = auth()
    if (!userId) return Promise.resolve([])
    const response = await db
      .update(DocumentsTable)
      .set({ archived: true, updated_at: new Date() })
      .where(
        and(
          eq(DocumentsTable.dataset_id, dataset_id),
          eq(DocumentsTable.short_id, uid),
          eq(DocumentsTable.created_by, userId)
        )
      )
    return { data: response, success: true }
  } catch (error) {
    redirect('/')
  }
}

export async function getDocumentsCount() {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])

  const documents = await db
    .select()
    .from(DatasetsTable)
    .orderBy(desc(DocumentsTable.created_at))
    .leftJoin(
      DocumentsTable,
      eq(DatasetsTable.short_id, DocumentsTable.dataset_id)
    )
    .where(
      and(
        eq(DocumentsTable.created_by, userId),
        eq(DocumentsTable.archived, false)
      )
    )

  const files = documents?.map((item) => item?.documents)
  let map = new Map()
  files?.forEach((item) => {
    const count = map.get(item?.dataset_id)
    if (count) {
      map.set(item?.dataset_id, count + 1)
    } else {
      map.set(item?.dataset_id, 1)
    }
  })
  return map
}

export async function getNotedData() {
  const apps = await getApps()
  const data = apps?.reduce((m: DocumentProps[], item: NewApp) => {
    const cur = pick(item, ['name', 'icon', 'short_id', 'uid']) as DocumentProps
    cur.uid = item.api_model_id || ''
    cur.app_id = item.short_id
    cur.type = 'annotated_data'
    m.push(cur)
    return m
  }, [])
  return {
    success: true,
    data,
  }
}

export async function getDataSplitPreview(
  datasetId: string,
  files: DocumentParamsType[],
  uid: string,
  preview: number
) {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])
  let api_dataset_id
  if (flags.enabledAIService) {
    const dataset = await getDataset(datasetId)
    api_dataset_id = dataset?.api_dataset_id
    if (!api_dataset_id) return Promise.resolve([])
    const data = await fetch(
      `${process.env.AI_SERVICE_API_BASE_URL}/v1/datasets/${api_dataset_id}?preview=${preview}&uid=${uid}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PATCH',
        body: JSON.stringify({ documents: files }),
      }
    ).then((res) => res.json())
    Promise.resolve(data)
  }
  return Promise.resolve([])
}
