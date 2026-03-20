import crypto from 'crypto'
import { db, orders } from '@bedo-fish/db'
import { eq } from 'drizzle-orm'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function generateCode(): string {
  const bytes = crypto.randomBytes(6)
  return Array.from(bytes)
    .map((b) => CHARS[b % CHARS.length])
    .join('')
}

export async function generateOrderRef(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = `BDF-${generateCode()}`
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.reference, reference))
      .limit(1)

    if (existing.length === 0) {
      return reference
    }
  }
  throw new Error('Failed to generate unique order reference after 5 attempts')
}
