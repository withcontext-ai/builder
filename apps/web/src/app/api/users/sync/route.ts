import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs'

import { logsnag } from '@/lib/logsnag'
import { editUser } from '@/db/users/actions'
import { formatUser } from '@/db/users/utils'

export async function GET() {
  try {
    const totalUsers = await clerkClient.users.getCount()

    const users = await clerkClient.users.getUserList({
      orderBy: '-created_at',
      limit: totalUsers,
    })

    const userValues = users.map(formatUser)

    const queue = []

    for (const user of userValues) {
      // const task = editUser(user.short_id, user)
      const task = logsnag?.identify({
        user_id: user.short_id,
        properties: {
          ...(user.email ? { email: user.email } : {}),
          ...(user.last_name ? { last_name: user.last_name } : {}),
          ...(user.first_name ? { first_name: user.first_name } : {}),
          ...(user.created_at
            ? { created_at: user.created_at.toUTCString() }
            : {}),
        },
      })
      queue.push(task)
    }

    await Promise.allSettled(queue)

    return NextResponse.json({
      success: true,
      data: { totalUsers, userValues },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
