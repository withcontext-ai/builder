import { clerkClient } from '@clerk/nextjs'
import { WebClient } from '@slack/web-api'
import { and, asc, desc, eq, sql } from 'drizzle-orm'
import { throttle } from 'lodash'

import { db } from '@/lib/drizzle-edge'
import { flags } from '@/lib/flags'
import { createSlackClient } from '@/lib/slack'
import { nanoid } from '@/lib/utils'
import { AppsTable } from '@/db/apps/schema'
import { addMessage } from '@/db/messages/actions'
import { MessagesTable } from '@/db/messages/schema'
import { formatEventMessage } from '@/db/messages/utils'
import { SessionsTable } from '@/db/sessions/schema'
import { SlackTeamAppsTable } from '@/db/slack_team_apps/schema'
import { NewSlackTeam, SlackTeamsTable } from '@/db/slack_teams/schema'
import {
  NewSlackUserApp,
  SlackUserApp,
  SlackUserAppsTable,
} from '@/db/slack_user_apps/schema'
import { SlackUser, SlackUsersTable } from '@/db/slack_users/schema'
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
        .where(eq(SlackTeamsTable.short_id, found.short_id))
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
  }): Promise<SlackUser> {
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
      const [slackUser] = await db
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
        const [slackUser] = await db
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
        const [slackUser] = await db
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

  async publishHomeViews(
    app_id: string,
    team_id: string,
    user_id: string,
    channel_id: string
  ) {
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
              value: JSON.stringify({
                channel_id,
                context_app_id: linkedApp.short_id,
              }),
              action_id: 'create_session',
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

  async createSession(context_user_id: string, context_app_id: string) {
    const [foundApp] = await db
      .select()
      .from(AppsTable)
      .where(eq(AppsTable.short_id, context_app_id))
      .limit(1)
    if (!foundApp) {
      throw new Error('App not found')
    }

    let api_session_id = null
    if (flags.enabledAIService) {
      const res = await fetch(
        `${process.env.AI_SERVICE_API_BASE_URL}/v1/chat/session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model_id: foundApp?.api_model_id,
          }),
        }
      )
      const json = await res.json()
      if (json.status !== 200) {
        throw new Error(`AI service error: ${json.message}`)
      }
      api_session_id = json?.data?.session_id
    }

    const [allSessions] = await db
      .select({ count: sql<number>`count(*)` })
      .from(SessionsTable)
      .where(
        and(
          eq(SessionsTable.app_id, context_app_id),
          eq(SessionsTable.created_by, context_user_id)
        )
      )
    const sessionCount = Number(allSessions?.count) || 0

    const sessionVal = {
      short_id: nanoid(),
      name: `Chat ${sessionCount + 1}`,
      app_id: context_app_id,
      api_session_id,
      created_by: context_user_id,
    }
    const [newSession] = await db
      .insert(SessionsTable)
      .values(sessionVal)
      .returning()

    if (foundApp.opening_remarks) {
      const message = formatEventMessage({
        session_id: newSession.short_id,
        event_type: 'basic.opening_remarks',
        content: foundApp.opening_remarks,
      })
      await addMessage(message)
    }

    return {
      app: foundApp,
      session: newSession,
    }
  }

  async addOrUpdateUserApp({
    app_id,
    team_id,
    user_id,
    context_app_id,
    context_session_id,
  }: Omit<NewSlackUserApp, 'short_id'>): Promise<SlackUserApp> {
    const [found] = await db
      .select()
      .from(SlackUserAppsTable)
      .where(
        and(
          eq(SlackUserAppsTable.app_id, app_id),
          eq(SlackUserAppsTable.team_id, team_id),
          eq(SlackUserAppsTable.user_id, user_id)
        )
      )
    if (found) {
      const [slackUserApp] = await db
        .update(SlackUserAppsTable)
        .set({
          context_app_id,
          context_session_id,
          updated_at: new Date(),
        })
        .where(eq(SlackUserAppsTable.short_id, found.short_id))
        .returning()
      return slackUserApp
    } else {
      const [slackUserApp] = await db
        .insert(SlackUserAppsTable)
        .values({
          short_id: nanoid(),
          app_id,
          team_id,
          user_id,
          context_app_id,
          context_session_id,
        })
        .returning()
      return slackUserApp
    }
  }

  async postMessage(channel: string, text: string) {
    return this.client.chat.postMessage({
      channel,
      text,
    })
  }

  updateMessage = throttle(
    async (channel: string, ts: string, text: string) => {
      return this.client.chat.update({
        channel,
        ts,
        text,
      })
    },
    200
  )

  async getCurrentSession(app_id: string, team_id: string, user_id: string) {
    const [slackUserApp] = await db
      .select({
        session_id: SessionsTable.short_id,
        api_session_id: SessionsTable.api_session_id,
      })
      .from(SlackUserAppsTable)
      .innerJoin(
        SessionsTable,
        eq(SessionsTable.short_id, SlackUserAppsTable.context_session_id)
      )
      .where(
        and(
          eq(SlackUserAppsTable.app_id, app_id),
          eq(SlackUserAppsTable.team_id, team_id),
          eq(SlackUserAppsTable.user_id, user_id)
        )
      )
      .orderBy(desc(SlackUserAppsTable.updated_at))
      .limit(1)
    return slackUserApp
  }

  async getMessages(session_id: string) {
    const sq = await db
      .select({
        query: MessagesTable.query,
        answer: MessagesTable.answer,
        created_at: MessagesTable.created_at,
      })
      .from(MessagesTable)
      .where(
        and(
          eq(MessagesTable.session_id, session_id),
          eq(MessagesTable.archived, false)
        )
      )
      .orderBy(desc(MessagesTable.created_at))
      .limit(10)
      .as('sq')

    const messages = await db.select().from(sq).orderBy(asc(sq.created_at))
    return messages
  }
}
