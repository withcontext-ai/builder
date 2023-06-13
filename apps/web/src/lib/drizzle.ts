import { InferModel } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { Pool } from 'pg'

export const UsersTable = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    image: text('image').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (users) => {
    return {
      uniqueIdx: uniqueIndex('unique_idx').on(users.email),
    }
  }
)

export type User = InferModel<typeof UsersTable>
export type NewUser = InferModel<typeof UsersTable, 'insert'>

const pool = new Pool({
  // connectionString: 'postgres://user:password@host:port/db',
  connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
})

export const db = drizzle(pool)
