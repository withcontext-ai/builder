import 'server-only'

import { sql } from 'drizzle-orm'

import { db } from '@/lib/drizzle'

import { NewUser, UsersTable } from './drizzle'

const newUsers: NewUser[] = [
  {
    name: 'Guillermo Rauch',
    email: 'rauchg@vercel.com',
    image:
      'https://pbs.twimg.com/profile_images/1576257734810312704/ucxb4lHy_400x400.jpg',
  },
  {
    name: 'Lee Robinson',
    email: 'lee@vercel.com',
    image:
      'https://pbs.twimg.com/profile_images/1587647097670467584/adWRdqQ6_400x400.jpg',
  },
  {
    name: 'Steven Tey',
    email: 'stey@vercel.com',
    image:
      'https://pbs.twimg.com/profile_images/1506792347840888834/dS-r50Je_400x400.jpg',
  },
]

export async function seed() {
  // await db.execute(sql`
  //   CREATE TABLE IF NOT EXISTS users (
  //     id SERIAL PRIMARY KEY,
  //     name VARCHAR(255) NOT NULL,
  //     email VARCHAR(255) UNIQUE NOT NULL,
  //     image VARCHAR(255),
  //     "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  //   );
  // `)
  // console.log(`Created "users" table`)

  // const insertedUsers = await db.insert(UsersTable).values(newUsers).returning()
  // console.log(`Seeded ${insertedUsers.length} users`)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS apps (
      id SERIAL PRIMARY KEY,
      short_id VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      icon VARCHAR(255) NOT NULL,
      created_by VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX user_id_index ON apps (created_by);
  `)
  console.log(`Created "apps" table`)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      short_id VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      app_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (app_id) REFERENCES apps(short_id)
    );
  `)
  console.log(`Created "sessions" table`)
}
