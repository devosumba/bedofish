import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
  index,
  unique,
  jsonb,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['customer', 'admin', 'super_admin'])

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'payment_pending',
  'paid',
  'processing',
  'dispatched',
  'delivered',
  'cancelled',
  'refunded',
])

export const paymentProviderEnum = pgEnum('payment_provider', ['payhero', 'stripe', 'manual'])

export const paymentMethodEnum = pgEnum('payment_method', ['mpesa', 'card', 'paypal', 'cash'])

export const paymentStatusEnum = pgEnum('payment_status', [
  'initiated',
  'pending',
  'confirmed',
  'failed',
  'refunded',
])

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 200 }),
    googleId: varchar('google_id', { length: 255 }).notNull().unique(),
    avatarUrl: text('avatar_url'),
    phone: varchar('phone', { length: 20 }),
    role: userRoleEnum('role').notNull().default('customer'),
    isActive: boolean('is_active').notNull().default(true),
    lastSignIn: timestamp('last_sign_in', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_users_email').on(t.email),
    index('idx_users_google_id').on(t.googleId),
  ]
)

// ─── NextAuth Required Tables ─────────────────────────────────────────────────

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }).notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    idToken: text('id_token'),
    sessionState: varchar('session_state', { length: 255 }),
  },
  (t) => [unique('accounts_provider_provider_account_id').on(t.provider, t.providerAccountId)]
)

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull().unique(),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (t) => [unique('verification_tokens_identifier_token').on(t.identifier, t.token)]
)

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 250 }).notNull().unique(),
  sizeVariant: varchar('size_variant', { length: 100 }).notNull(),
  description: text('description'),
  priceKes: numeric('price_kes', { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
  stockQty: integer('stock_qty').notNull().default(0),
  sku: varchar('sku', { length: 100 }).unique(),
  badge: varchar('badge', { length: 50 }),
  imageUrl: text('image_url'),
  imageUrls: text('image_urls').array(),
  isActive: boolean('is_active').notNull().default(true),
  isFeatured: boolean('is_featured').notNull().default(false),
  weightGrams: integer('weight_grams'),
  sortOrder: integer('sort_order').notNull().default(0),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDesc: text('meta_desc'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Delivery Zones ───────────────────────────────────────────────────────────

export const deliveryZones = pgTable('delivery_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  areas: text('areas').array().notNull().default(sql`'{}'::text[]`),
  feeKes: numeric('fee_kes', { precision: 10, scale: 2 }).notNull().default('150.00'),
  freeThreshold: numeric('free_threshold', { precision: 10, scale: 2 }).notNull().default('1500.00'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  reference: varchar('reference', { length: 30 }).notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  status: orderStatusEnum('status').notNull().default('pending'),
  subtotalKes: numeric('subtotal_kes', { precision: 10, scale: 2 }).notNull(),
  deliveryFeeKes: numeric('delivery_fee_kes', { precision: 10, scale: 2 }).notNull().default('0.00'),
  totalKes: numeric('total_kes', { precision: 10, scale: 2 }).notNull(),
  deliveryZoneId: uuid('delivery_zone_id').references(() => deliveryZones.id, { onDelete: 'set null' }),
  // Delivery snapshot
  dFirstName: varchar('d_first_name', { length: 100 }).notNull(),
  dLastName: varchar('d_last_name', { length: 100 }).notNull(),
  dPhone: varchar('d_phone', { length: 30 }).notNull(),
  dEmail: varchar('d_email', { length: 255 }).notNull(),
  dAddress: text('d_address').notNull(),
  dCity: varchar('d_city', { length: 100 }).notNull(),
  dArea: varchar('d_area', { length: 100 }),
  dNotes: text('d_notes'),
  estimatedDelivery: timestamp('estimated_delivery', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelReason: text('cancel_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Order Items ──────────────────────────────────────────────────────────────

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: varchar('product_name', { length: 200 }).notNull(),
  productSize: varchar('product_size', { length: 100 }).notNull(),
  unitPriceKes: numeric('unit_price_kes', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  lineTotalKes: numeric('line_total_kes', { precision: 10, scale: 2 }).notNull(),
})

// ─── Payments ─────────────────────────────────────────────────────────────────

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'restrict' }),
  provider: paymentProviderEnum('provider').notNull().default('payhero'),
  method: paymentMethodEnum('method').notNull(),
  status: paymentStatusEnum('status').notNull().default('initiated'),
  amountKes: numeric('amount_kes', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('KES'),
  payheroRef: varchar('payhero_ref', { length: 255 }),
  mpesaReceipt: varchar('mpesa_receipt', { length: 255 }),
  mpesaPhone: varchar('mpesa_phone', { length: 30 }),
  payheroPayload: jsonb('payhero_payload'),
  callbackPayload: jsonb('callback_payload'),
  initiatedAt: timestamp('initiated_at', { withTimezone: true }).notNull().defaultNow(),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
})

// ─── Cart Sessions ────────────────────────────────────────────────────────────

export const cartSessions = pgTable('cart_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  sessionId: varchar('session_id', { length: 255 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── Cart Items ───────────────────────────────────────────────────────────────

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cartSessionId: uuid('cart_session_id')
      .notNull()
      .references(() => cartSessions.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('cart_items_session_product').on(t.cartSessionId, t.productId)]
)

// ─── Order Status History ─────────────────────────────────────────────────────

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  fromStatus: orderStatusEnum('from_status'),
  toStatus: orderStatusEnum('to_status').notNull(),
  note: text('note'),
  changedBy: uuid('changed_by').references(() => users.id, { onDelete: 'set null' }),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
})
