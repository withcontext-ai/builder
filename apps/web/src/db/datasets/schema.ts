import { InferModel } from 'drizzle-orm'
import {
  index,
  integer,
  json,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const DatasetsTable = pgTable(
  'datasets',
  {
    id: serial('id').primaryKey(),
    short_id: text('short_id').notNull(),
    user_id: text('user_id').notNull(),
    created_by: text('created_by').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    name: text('name').notNull(),
    config: json('config'),
  },
  (datasets) => {
    return {
      unique_idx: uniqueIndex('unique_idx').on(datasets.short_id),
      user_id_idx: index('user_id_idx').on(datasets.user_id),
    }
  }
)

export type Datasets = InferModel<typeof DatasetsTable>
export type NewDataset = InferModel<typeof DatasetsTable, 'insert'>
