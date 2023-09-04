import { InferModel } from 'drizzle-orm'
import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

import { SessionsTable } from '../sessions/schema'

export const MessagesTable = pgTable(
  'messages',
  {
    id: serial('id').primaryKey(),
    short_id: text('short_id').unique().notNull(),
    name: text('name').notNull(),
    session_id: text('session_id')
      .references(() => SessionsTable.short_id)
      .notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    archived: boolean('archived').default(false).notNull(),
    // base message
    type: text('type').notNull(), // 'chat' | 'event'
    role: text('role'), // 'user' | 'assistant'
    // chat message
    content: text('content'),
    feedback: text('feedback'), // 'good' | 'bad'
    feedback_content: text('feedback_content'),
    latency: text('latency'),
    total_tokens: text('total_tokens'),
    raw: text('raw'),
    // event message
    eventType: text('eventType'), // 'call.created' | 'call.declined' | 'call.ended' | 'call.canceled'
  },
  (messages) => {
    return {
      unique_idx: uniqueIndex('unique_idx').on(messages.short_id),
    }
  }
)

export type Message = InferModel<typeof MessagesTable>
export type NewMessage = InferModel<typeof MessagesTable, 'insert'>
