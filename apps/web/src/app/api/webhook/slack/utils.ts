import { clerkClient } from '@clerk/nextjs'
import { WebClient } from '@slack/web-api'
import { and, eq } from 'drizzle-orm'

import { db } from '@/lib/drizzle-edge'
import { createSlackClient } from '@/lib/slack'
import { nanoid } from '@/lib/utils'
import { NewSlackTeam, SlackTeamsTable } from '@/db/slack_teams/schema'
import { SlackUsersTable } from '@/db/slack_users/schema'
import { UsersTable } from '@/db/users/schema'

export class SlackUtils {
  client: WebClient

  constructor(access_token: string) {
    this.client = createSlackClient(access_token)
  }

  async addOrUpdateTeam({
    app_id,
    team_id,
    team_name,
    team_url,
    team_icon,
    access_token,
    scope,
  }: Omit<NewSlackTeam, 'short_id'>) {
    const [found] = await db
      .select()
      .from(SlackTeamsTable)
      .where(
        and(
          eq(SlackTeamsTable.app_id, app_id),
          eq(SlackTeamsTable.team_id, team_id)
        )
      )
    if (found) {
      return db
        .update(SlackTeamsTable)
        .set({
          team_name,
          team_url,
          team_icon,
          access_token,
          scope,
        })
        .where(eq(SlackTeamsTable.id, found.id))
        .returning()
    } else {
      return db
        .insert(SlackTeamsTable)
        .values({
          short_id: nanoid(),
          app_id,
          team_id,
          team_name,
          team_url,
          team_icon,
          access_token,
          scope,
        })
        .returning()
    }
  }

  async addOrUpdateUser({
    app_id,
    team_id,
    user_id,
  }: {
    app_id: string
    team_id: string
    user_id: string
  }) {
    const [found] = await db
      .select()
      .from(SlackUsersTable)
      .where(
        and(
          eq(SlackUsersTable.app_id, app_id),
          eq(SlackUsersTable.team_id, team_id),
          eq(SlackUsersTable.user_id, user_id),
          eq(SlackUsersTable.archived, false)
        )
      )
    if (found) {
      const user = await this.getUserInfo(user_id)
      const slackUser = await db
        .update(SlackUsersTable)
        .set({ is_admin: user?.is_admin })
        .where(
          and(
            eq(SlackUsersTable.app_id, app_id),
            eq(SlackUsersTable.team_id, team_id),
            eq(SlackUsersTable.user_id, user_id),
            eq(SlackUsersTable.archived, false)
          )
        )
        .returning()
      return slackUser
    } else {
      const user = await this.getUserInfo(user_id)
      const email = user?.profile?.email
      if (!email)
        throw new Error('email is undefined, add scope users:read.email')
      const [found] = await db
        .select()
        .from(UsersTable)
        .where(and(eq(UsersTable.email, email), eq(UsersTable.archived, false)))
      if (found) {
        const slackUser = await db
          .insert(SlackUsersTable)
          .values({
            short_id: nanoid(),
            app_id,
            team_id,
            user_id,
            context_user_id: found.short_id,
            is_admin: user.is_admin,
          })
          .returning()
        return slackUser
      } else {
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [email],
          firstName: user?.profile?.first_name,
          lastName: user?.profile?.last_name,
          skipPasswordChecks: false,
          skipPasswordRequirement: false,
        })
        try {
          await db.insert(UsersTable).values({
            short_id: clerkUser.id,
            email,
          })
        } catch (error) {
          console.error(error)
        }
        const slackUser = await db
          .insert(SlackUsersTable)
          .values({
            short_id: nanoid(),
            app_id,
            team_id,
            user_id,
            context_user_id: clerkUser.id,
            is_admin: user.is_admin,
          })
          .returning()
        return slackUser
      }
    }
  }

  async getUserInfo(user_id: string) {
    const userInfo = await this.client.users.info({
      user: user_id,
    })

    return userInfo.user
  }
}
