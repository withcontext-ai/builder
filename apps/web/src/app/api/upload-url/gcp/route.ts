import { NextRequest, NextResponse } from 'next/server'
import { Storage } from '@google-cloud/storage'

import { nanoid } from '@/lib/utils'

const UPLOAD_FOLDER = 'public-tmp'
const BUCKET_NAME = process.env.GCP_STORAGE_BUCKET_NAME

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!BUCKET_NAME)
      return NextResponse.json({
        success: false,
        error: 'env GCP_STORAGE_BUCKET_NAME is not found',
      })

    const { searchParams } = request.nextUrl
    const id = nanoid()
    const filename = searchParams.get('filename') || ''
    const ext = filename.split('.').pop()

    const credentials = JSON.parse(
      Buffer.from(
        process.env.GOOGLE_APPLICATION_CREDENTIALS!,
        'base64'
      ).toString()
    )
    const storage = new Storage({
      projectId: credentials.project_id,
      credentials,
    })
    const bucket = storage.bucket(BUCKET_NAME)
    const path = `${UPLOAD_FOLDER}/${id}${ext ? `.${ext}` : ''}`
    const file = bucket.file(path)
    const options = {
      expires: Date.now() + 1 * 60 * 1000, // url expires in 1 minute
    }

    const [response] = await file.generateSignedPostPolicyV4(options)
    const { url, fields } = response

    const data = {
      provider: 'gcp',
      upload_url: url,
      upload_fields: fields,
      file_url: `https://storage.googleapis.com/${BUCKET_NAME}/${path}`,
      file_path: path,
    }

    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  }
}
