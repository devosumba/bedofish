import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL ?? process.env.DATABASE_URL_LOCAL

if (!connectionString) {
  throw new Error('DATABASE_URL or DATABASE_URL_LOCAL environment variable is required')
}

const isDev = process.env.NODE_ENV !== 'production'

const client = postgres(connectionString, {
  ssl: isDev ? false : { rejectUnauthorized: true },
})

export const db = drizzle(client, { schema })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function withTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
  return db.transaction(fn)
}

export * from './schema'

// Inferred types from schema
export type User = typeof schema.users.$inferSelect
export type NewUser = typeof schema.users.$inferInsert
export type Category = typeof schema.categories.$inferSelect
export type NewCategory = typeof schema.categories.$inferInsert
export type Product = typeof schema.products.$inferSelect
export type NewProduct = typeof schema.products.$inferInsert
export type DeliveryZone = typeof schema.deliveryZones.$inferSelect
export type Order = typeof schema.orders.$inferSelect
export type NewOrder = typeof schema.orders.$inferInsert
export type OrderItem = typeof schema.orderItems.$inferSelect
export type NewOrderItem = typeof schema.orderItems.$inferInsert
export type Payment = typeof schema.payments.$inferSelect
export type NewPayment = typeof schema.payments.$inferInsert
export type CartSession = typeof schema.cartSessions.$inferSelect
export type CartItemRow = typeof schema.cartItems.$inferSelect
export type OrderStatusHistoryRow = typeof schema.orderStatusHistory.$inferSelect
export type Account = typeof schema.accounts.$inferSelect
export type Session = typeof schema.sessions.$inferSelect
