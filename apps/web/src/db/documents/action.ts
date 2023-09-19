import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { omit, pick } from 'lodash'
import { nanoid } from 'nanoid'

import { db } from '@/lib/drizzle-edge'
import { FileProps } from '@/components/upload/utils'

import { AppsTable } from '../apps/schema'
import { Documents, DocumentsTable, NewDocument } from './schema'

export type newDocumentParams = {
  config: Record<string, any>
  documents: any[]
  dataset_id: string
  type?: string
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
export async function getDocumentByTable({
  dataset_id,
  params,
}: geDocumentParams) {
  const { search = '', pageSize = 10, pageIndex = 0 } = params
  const item = await db
    .select()
    .from(DocumentsTable)
    .orderBy(desc(DocumentsTable.created_at))
    .where(
      and(
        eq(DocumentsTable.archived, false),
        eq(DocumentsTable.dataset_id, dataset_id)
      )
    )
  let res = item
  if (search) {
    res = item?.filter((item: NewDocument) => item?.name?.includes(search))
  }
  res?.slice(pageIndex * pageSize, pageSize * (pageIndex + 1))
  return res
}

async function findApps(ids: string[]) {
  return await db
    .select({
      name: AppsTable.name,
      icon: AppsTable.icon,
      uid: AppsTable.api_model_id,
      appId: AppsTable.short_id,
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
  }
}

export async function addDocuments(data: newDocumentParams) {
  try {
    const { userId } = auth()

    if (!userId) return Promise.resolve([])
    const { type, documents: _documents, dataset_id } = data
    const isPdf = type === 'pdf'
    let documents = []
    if (isPdf) {
      documents = _documents?.reduce((m: any[], cur: FileProps) => {
        // @ts-ignore
        const config = cur?.splitConfig
        const attributes = omit(cur, ['splitConfig', 'loaderType'])
        const item = createEmptyDocument(dataset_id, userId, config, attributes)
        m.push(item)
        return m
      }, [])
    } else {
      const ids = _documents?.map((item) => item?.uid)
      const apps = await findApps(ids)
      documents = _documents?.reduce((m: any[], cur: any, index) => {
        const config = cur?.splitConfig
        const attributes = apps[index]
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

    const [item] = await db
      .select()
      .from(DocumentsTable)
      .where(eq(DocumentsTable.short_id, id))
      .limit(1)
    console.log(item, '-----item')
    if (!item) {
      throw new Error('Document not found')
    }

    return item
  } catch (error) {
    redirect('/')
  }
}

export async function editDocument(
  id: string,
  document: Omit<Document, 'short_id' | 'create_by'>
) {
  try {
    const { userId } = auth()
    if (!userId) return Promise.resolve([])

    const response = await db
      .update(DocumentsTable)
      .set({ ...document, updated_at: new Date() })
      .where(
        and(
          eq(DocumentsTable.short_id, id),
          eq(DocumentsTable.created_by, userId)
        )
      )
    return { data: response, success: true }
  } catch (error) {
    redirect('/')
  }
}

export async function deleteDocument(id: string, dataset_id: string) {
  try {
    const { userId } = auth()
    if (!userId) return Promise.resolve([])
    console.log(id, dataset_id, '----id')
    const response = await db
      .update(DocumentsTable)
      .set({ archived: true, updated_at: new Date() })
      .where(
        and(
          eq(DocumentsTable.dataset_id, dataset_id),
          eq(DocumentsTable.short_id, id),
          eq(DocumentsTable.created_by, userId)
        )
      )
    console.log(response, '---response')
    return { data: response, success: true }
  } catch (error) {
    redirect('/')
  }
}
