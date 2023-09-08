import { NextResponse } from 'next/server'
import { and, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@/lib/drizzle-edge'
import { flags } from '@/lib/flags'
import { logsnag } from '@/lib/logsnag'
import { AppsTable } from '@/db/apps/schema'
import { MessagesTable } from '@/db/messages/schema'
import { SessionsTable } from '@/db/sessions/schema'
import { UsersTable } from '@/db/users/schema'

export const runtime = 'edge'

export async function GET() {
  try {
    const startTime = Date.now()

    const totalAppsCountTask = getTotalAppsCount()
    const totalSessionsCountTask = getTotalSessionsCount()
    const totalMessagesCountTask = getTotalMessagesCount()
    const totalUsersCountTask = getTotalUsersCount()
    const activeUsersCountTask = getActiveUsersCount()

    const queue = [
      totalAppsCountTask,
      totalSessionsCountTask,
      totalMessagesCountTask,
      totalUsersCountTask,
      activeUsersCountTask,
    ]

    const [
      totalAppsCount,
      totalSessionsCount,
      totalMessagesCount,
      totalUsersCount,
      activeUsersCount,
    ] = await Promise.all(queue)

    const avgMessagesPerSession = +(
      Math.round((totalMessagesCount / totalSessionsCount) * 100) / 100
    ).toFixed(2)

    const activeUsersPercentage =
      +(
        Math.round((activeUsersCount / totalUsersCount) * 10000) / 10000
      ).toFixed(4) * 100

    const data = {
      totalAppsCount,
      totalSessionsCount,
      totalMessagesCount,
      avgMessagesPerSession,
      totalUsersCount,
      activeUsersCount,
      activeUsersPercentage,
    }

    if (flags.isProd) {
      const queue = []
      const pub = logsnag?.track({
        channel: 'insight',
        event: 'Web Insight',
        icon: '➡️',
        description: `- Total Apps: ${totalAppsCount}\n- Total Chats: ${totalSessionsCount}\n- Total Messages: ${totalMessagesCount}\n- Average Messages Per Chat: ${avgMessagesPerSession}\n- Total Users: ${totalUsersCount}\n- Active Users: ${activeUsersCount}\n- Active Users Percentage (%): ${activeUsersPercentage}`,
        tags: {
          'total-apps-count': totalAppsCount,
          'total-sessions-count': totalSessionsCount,
          'total-messages-count': totalMessagesCount,
          'avg-messages-per-session': avgMessagesPerSession,
          'total-users-count': totalUsersCount,
          'active-users-count': activeUsersCount,
          'active-users-percentage': activeUsersPercentage,
        },
        parser: 'markdown',
      })
      queue.push(pub)
      const insights = [
        {
          title: 'Total Apps',
          value: totalAppsCount,
          icon: '🤖',
        },
        {
          title: 'Total Chats',
          value: totalSessionsCount,
          icon: '💭',
        },
        {
          title: 'Total Messages',
          value: totalMessagesCount,
          icon: '💬',
        },
        {
          title: 'Average Messages Per Chat',
          value: avgMessagesPerSession,
          icon: '💬',
        },
        {
          title: 'Total Users',
          value: totalUsersCount,
          icon: '🧑',
        },
        {
          title: 'Active Users',
          value: activeUsersCount,
          icon: '🏃',
        },
        {
          title: 'Active Users Percentage (%)',
          value: activeUsersPercentage,
        },
      ]
      for (const insight of insights) {
        const task = logsnag?.insight.track(insight)
        queue.push(task)
      }
      await Promise.all(queue)
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    return NextResponse.json({ success: true, data, duration })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function getTotalAppsCount() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(AppsTable)
    .where(eq(AppsTable.archived, false))
  return +count
}

async function getTotalSessionsCount() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(SessionsTable)
  return +count
}

async function getTotalMessagesCount() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(MessagesTable)
    .where(eq(MessagesTable.archived, false))
  return +count
}

async function getTotalUsersCount() {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(UsersTable)
    .where(eq(UsersTable.archived, false))
  return +count
}

async function getActiveUsersCount() {
  const users = await db
    .select({ short_id: UsersTable.short_id })
    .from(UsersTable)
    .where(eq(UsersTable.archived, false))

  let totalActiveUsersCount = 0
  for (const user of users) {
    if (user.short_id) {
      const sessionsIdQuery = db
        .select({ data: SessionsTable.short_id })
        .from(SessionsTable)
        .where(
          and(
            eq(SessionsTable.created_by, user.short_id),
            eq(SessionsTable.archived, false)
          )
        )
      const [{ count: totalMessagesCount }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(MessagesTable)
        .where(inArray(MessagesTable.session_id, sessionsIdQuery))
      if (totalMessagesCount > 10) {
        totalActiveUsersCount += 1
      }
    }
  }

  return totalActiveUsersCount
}
