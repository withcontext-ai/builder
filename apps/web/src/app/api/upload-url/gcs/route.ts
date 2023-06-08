import { NextResponse } from 'next/server'
import { Storage } from '@google-cloud/storage'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || 'defaultId'

    const storage = new Storage()

    const options = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      // contentType: 'application/octet-stream',
      contentType: 'multipart/form-data',
    }

    const [url] = await storage
      .bucket('context-builder')
      .file('Chat.png')
      .getSignedUrl(options)

    return NextResponse.json({ success: true, url })
  } catch (e) {
    console.log('e:', e)
    return NextResponse.json({ success: false })
  }
}

// curl -X PUT -H 'Content-Type: application/octet-stream' --upload-file ./Chat.png "https://storage.googleapis.com/context-builder/Chat.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=builder%40withcontextai.iam.gserviceaccount.com%2F20230608%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20230608T070414Z&X-Goog-Expires=900&X-Goog-SignedHeaders=content-type%3Bhost&X-Goog-Signature=b82d9f64ca1c6bbf04a0d22fbb93262bfd4b9bb98a366d89f75d768e4fbe2e1f5e606a47a73fe48708201613e204dd2b07c7f2031b0fed8246b7426ca306af655cf855b63f3a368e1b9b3b4fc1d12eed52260d971a5b9d322247bb67fe1b8c1f5514c720e49f66587ce83c14642cd50726f6c1c1ff147f070d6071e1033ee8b944f801adfc9ee6aa83bffe19969856f3a2152ffe29d99fe8e8ece2b5866e521fb32900a815384affe23c56d69917aeae7d3d20eb0f3f86ff3d713611eada2f1b6f567a7d25f872f6bac856dc8df44d3ce407cb749910dae8f863d58fa1c6c5dfe02c3d7a54dce1673b4a32e0b0a5af63335311ed5ab2568a41f9b1f528c8abac"
