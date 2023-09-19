import 'server-only'

import { eq } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle-edge'

import { SlackTeamAppsTable } from './schema'

export async function getLinkedTeamList(context_app_id: string) {
  try {
    const { userId } = auth()
    if (!userId) {
      throw new Error('Not authenticated')
    }

    const teamList = await db
      .select()
      .from(SlackTeamAppsTable)
      .where(eq(SlackTeamAppsTable.context_app_id, context_app_id))

    return teamList
  } catch (error: any) {
    console.log('error:', error.message)
  }
}
