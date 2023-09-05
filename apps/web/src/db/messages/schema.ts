import { InferModel } from 'drizzle-orm'
import {
  bigint,
  boolean,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

import { SessionsTable } from '../sessions/schema'

export const typeEnum = pgEnum('type', ['chat', 'event'])
export const roleEnum = pgEnum('role', ['system', 'user', 'assistant'])
export const feedbackEnum = pgEnum('feedback', ['good', 'bad'])

export const MessagesTable = pgTable(
  'messages',
  {
    id: serial('id').primaryKey(),
    short_id: text('short_id').unique().notNull(),
    session_id: text('session_id')
      .references(() => SessionsTable.short_id)
      .notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    archived: boolean('archived').default(false).notNull(),
    // base message
    type: typeEnum('type').default('chat').notNull(),
    role: roleEnum('role'),
    // chat message
    content: text('content'),
    feedback: feedbackEnum('feedback'),
    feedback_content: text('feedback_content'),
    latency: bigint('latency', { mode: 'number' }),
    total_tokens: bigint('total_tokens', { mode: 'number' }),
    raw: text('raw'),
    annotation: text('annotation'),
    // event message
    event_type: text('event_type'), // 'call.created' | 'call.declined' | 'call.ended' | 'call.canceled'
  },
  (messages) => {
    return {
      unique_idx: uniqueIndex('unique_idx').on(messages.short_id),
    }
  }
)

export type Message = InferModel<typeof MessagesTable>
export type NewMessage = InferModel<typeof MessagesTable, 'insert'>
