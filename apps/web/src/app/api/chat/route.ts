import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { and, eq } from 'drizzle-orm'

import { auth, currentUserEmail } from '@/lib/auth'
import { db } from '@/lib/drizzle-edge'
import { flags } from '@/lib/flags'
import { logsnag } from '@/lib/logsnag'
import { OpenAIStream } from '@/lib/openai-stream'
import { nanoid } from '@/lib/utils'
import { addMessage, editMessage } from '@/db/messages/actions'
import { MessagesTable } from '@/db/messages/schema'

const redis = Redis.fromEnv()

export const runtime = 'edge'
// TODO: move to pdx1 (us-west-2) where db is located
// https://vercel.com/docs/edge-network/regions
export const preferredRegion = 'cle1' // now at us-east-2 where ai service is located
export const dynamic = 'force-dynamic'

const baseUrl = `${process.env.AI_SERVICE_API_BASE_URL}/v1`

type MessageDTO =
  | {
      role: 'user'
      content: string
    }
  | {
      id: string
      role: 'assistant'
      content: string
    }

export async function POST(req: NextRequest, res: NextResponse) {
  const s = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        `\n[DATA]${JSON.stringify({
          error:
            'The sweet aroma of freshly baked bread filled the cozy bakery, tempting passersby to step inside and savor the warm goodness.',
        })}[DATAEND]`
      )
      try {
        controller.close()
      } catch {}
    },
  })
  return new Response(s)
}
