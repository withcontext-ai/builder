import { NextRequest, NextResponse } from 'next/server'
import * as Bytescale from '@bytescale/sdk'
import { desc, eq } from 'drizzle-orm'
import pLimit from 'p-limit'

import { db } from '@/lib/drizzle-edge'
import { DocumentsTable } from '@/db/documents/schema'

const limit = pLimit(5)

const accountId = process.env.NEXT_PUBLIC_BYTESCALE_PUBLIC_ACCOUNT_ID
const uploadApi = new Bytescale.UploadApi({
  apiKey: process.env.BYTESCALE_SECRET_API_KEY || 'free',
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret')
    if (secret == null || secret !== process.env.SECRET) {
      return NextResponse.json({ success: true })
    }

    const docs = await db
      .select()
      .from(DocumentsTable)
      .orderBy(desc(DocumentsTable.created_at))
      .limit(3)
    const filteredDocs = docs.filter(
      (d) => !!d.url && d.url.startsWith('https://storage.googleapis.com/')
    )
    const newDocs: any[] = []

    const queue = []

    for (const doc of filteredDocs) {
      const { short_id, url } = doc

      if (url && accountId) {
        queue.push(
          limit(async () => {
            console.log('upload:', short_id, url)
            const result = await uploadApi.uploadFromUrl({
              accountId,
              uploadFromUrlRequest: { url },
            })
            const newUrl = result.fileUrl
            console.log('new doc:', short_id, newUrl)
            newDocs.push({ short_id, url: newUrl })
            return db
              .update(DocumentsTable)
              .set({ url: newUrl })
              .where(eq(DocumentsTable.short_id, short_id))
          })
        )
      }
    }

    await Promise.allSettled(queue)

    const data = {
      docs,
      filteredDocs,
      newDocs,
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
