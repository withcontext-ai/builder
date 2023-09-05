import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs'
import { and, eq } from 'drizzle-orm'

import { db } from '@/lib/drizzle-edge'
import { FileProps } from '@/components/upload/utils'

import { Documents, DocumentsTable, NewDocument } from './schema'

export type newDocumentParams = {
  config: Record<string, any>
  documents: FileProps[]
  dataset_id: string
}

export async function getDocuments(datasetId: string) {
  try {
    const [item] = await db
      .select()
      .from(DocumentsTable)
      .where(eq(DocumentsTable.dataset_id, datasetId))
      .limit(1)

    if (!item) {
      throw new Error('Dataset not found')
    }

    return item
  } catch (error) {
    redirect('/')
  }
}

export async function addDocuments(data: newDocumentParams) {
  try {
    const { userId } = auth()
    if (!userId) return Promise.resolve([])
    const documents = data?.documents?.reduce((m: any[], cur: FileProps) => {
      const item = {
        config: data?.config,
        name: cur?.name,
        type: cur?.type,
        updated_at: new Date(),
        dataset_id: data?.dataset_id,
        create_by: userId,
      }
      m.push(item)
      return m
    }, [])
    await db.insert(DocumentsTable).values(documents).returning()
    return { data, success: true }
  } catch (error) {
    redirect('/')
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

export async function deleteDocument(id: string) {
  try {
    const { userId } = auth()
    if (!userId) return Promise.resolve([])

    const response = await db
      .update(DocumentsTable)
      .set({ archived: true, updated_at: new Date() })
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
