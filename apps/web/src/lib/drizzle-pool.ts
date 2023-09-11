import { Pool as PoolServerless } from '@neondatabase/serverless'
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless'

const pool = new PoolServerless({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10 * 1000, // wait 10s before timing out when connecting a new client
})

export const db = drizzleServerless(pool as PoolServerless)
