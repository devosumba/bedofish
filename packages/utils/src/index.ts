// Shared utility functions for Bedo Fish platform

/**
 * Format a price in KES for display
 */
export function formatKes(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Normalize a Kenyan phone number to 254XXXXXXXXX format
 * Accepts: 07XXXXXXXX, +254XXXXXXXXX, 254XXXXXXXXX
 */
export function normalizeKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '')

  if (/^07[0-9]{8}$/.test(cleaned)) {
    return `254${cleaned.slice(1)}`
  }
  if (/^\+254[0-9]{9}$/.test(cleaned)) {
    return cleaned.slice(1)
  }
  if (/^254[0-9]{9}$/.test(cleaned)) {
    return cleaned
  }

  throw new Error(`Invalid Kenyan phone number: ${phone}`)
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Compute delivery fee based on subtotal
 */
export function computeDeliveryFee(subtotalKes: number): number {
  return subtotalKes >= 1500 ? 0 : 150
}
