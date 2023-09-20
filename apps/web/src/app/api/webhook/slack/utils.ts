import { clerkClient } from '@clerk/nextjs'
import { WebClient } from '@slack/web-api'
import { and, eq } from 'drizzle-orm'

import { db } from '@/lib/drizzle-edge'
import { createSlackClient } from '@/lib/slack'
import { nanoid } from '@/lib/utils'
import { AppsTable } from '@/db/apps/schema'
import { SlackTeamAppsTable } from '@/db/slack_team_apps/schema'
import { NewSlackTeam, SlackTeamsTable } from '@/db/slack_teams/schema'
import { SlackUsersTable } from '@/db/slack_users/schema'
import { UsersTable } from '@/db/users/schema'

export async function getAccessToken(app_id: string, team_id: string) {
  const [item] = await db
    .select()
    .from(SlackTeamsTable)
    .where(
      and(
        eq(SlackTeamsTable.app_id, app_id),
        eq(SlackTeamsTable.team_id, team_id),
        eq(SlackTeamsTable.archived, false)
      )
    )
    .limit(1)

  return item?.access_token
}

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

  async publishHomeViews(app_id: string, team_id: string, user_id: string) {
    const linkedApps = await db
      .select({
        short_id: AppsTable.short_id,
        name: AppsTable.name,
        icon: AppsTable.icon,
        description: AppsTable.description,
      })
      .from(SlackTeamAppsTable)
      .leftJoin(
        AppsTable,
        eq(SlackTeamAppsTable.context_app_id, AppsTable.short_id)
      )
      .where(
        and(
          eq(SlackTeamAppsTable.app_id, app_id),
          eq(SlackTeamAppsTable.team_id, team_id)
        )
      )

    const appListBlocks = []
    for (const linkedApp of linkedApps) {
      const sections = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${linkedApp.name}*\n${linkedApp.description ?? ''}`,
          },
          ...(linkedApp.icon && {
            accessory: {
              type: 'image',
              image_url: linkedApp.icon,
              alt_text: linkedApp.name,
            },
          }),
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Chat',
                emoji: true,
              },
              value: linkedApp.short_id,
              action_id: 'new_session',
            },
          ],
        },
        {
          type: 'divider',
        },
      ]
      appListBlocks.push(...sections)
    }

    await this.client.views.publish({
      user_id,
      view: {
        type: 'home',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Select an App to chat*',
            },
          },
          {
            type: 'divider',
          },
          ...appListBlocks,
        ],
      },
    })
  }
}
