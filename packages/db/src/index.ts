import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL ?? process.env.DATABASE_URL_LOCAL

if (!connectionString) {
  throw new Error('DATABASE_URL or DATABASE_URL_LOCAL environment variable is required')
}

const client = postgres(connectionString)
export const db = drizzle(client, { schema })

export * from './schema'
