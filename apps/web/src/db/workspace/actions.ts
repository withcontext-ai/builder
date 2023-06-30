import 'server-only'

import { and, desc, eq, sql } from 'drizzle-orm'

import { auth } from '@/lib/auth'
import { db } from '@/lib/drizzle'
import { nanoid } from '@/lib/utils'

import { AppsTable } from '../apps/schema'
import { SessionsTable } from '../sessions/schema'
import { WorkspaceTable } from './schema'

interface WorkspaceItem {
  app_id: string
  app_name: string
  app_icon: string
  session_id: string
}

export async function addToWorkspace(appId: string) {
  const { userId } = auth()
  if (!userId) return Promise.resolve(null)

  const val = { short_id: nanoid(), app_id: appId, user_id: userId }
  await db.insert(WorkspaceTable).values(val).returning()

  return Promise.resolve({ appId })
}

export async function getWorkspace() {
  const { userId } = auth()
  if (!userId) return Promise.resolve([])

  const result = await db
    .selectDistinctOn([AppsTable.short_id], {
      app_id: AppsTable.short_id,
      app_name: AppsTable.name,
      app_icon: AppsTable.icon,
      session_id: SessionsTable.short_id,
      created_at: WorkspaceTable.created_at,
    })
    .from(WorkspaceTable)
    .orderBy(desc(WorkspaceTable.created_at))
    .where(
      and(
        eq(WorkspaceTable.user_id, userId),
        eq(WorkspaceTable.archived, false)
      )
    )
    .rightJoin(
      AppsTable,
      and(
        eq(WorkspaceTable.app_id, AppsTable.short_id),
        eq(AppsTable.archived, false)
      )
    )
    .leftJoin(
      SessionsTable,
      and(
        eq(AppsTable.short_id, SessionsTable.app_id),
        eq(SessionsTable.archived, false)
      )
    )
    .orderBy(
      AppsTable.short_id,
      desc(SessionsTable.created_at),
      desc(WorkspaceTable.created_at)
    )

  const sorted = result.sort(
    (a, b) => (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0)
  )

  return sorted

  // // raw sql
  // const result = await db.execute(sql`
  //   SELECT DISTINCT ON (apps.short_id)
  //     apps.short_id AS app_id,
  //     apps.name AS app_name,
  //     apps.icon AS app_icon,
  //     sessions.short_id AS session_id
  //   FROM
  //     workspace
  //   LEFT JOIN
  //     apps ON workspace.app_id = apps.short_id
  //   LEFT JOIN
  //     sessions ON apps.short_id = sessions.app_id
  //   ORDER BY
  //     apps.short_id,
  //     sessions.created_at DESC,
  //     workspace.created_at DESC;
  //   `)
  // return (result.rows || []) as unknown as WorkspaceItem[]
}

export async function removeFromWorkspace(appId: string) {
  const { userId } = auth()
  if (!userId) return Promise.resolve(null)

  return db
    .update(WorkspaceTable)
    .set({ archived: true, updated_at: new Date() })
    .where(
      and(eq(WorkspaceTable.app_id, appId), eq(WorkspaceTable.user_id, userId))
    )
}
