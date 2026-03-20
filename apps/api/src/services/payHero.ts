import crypto from 'crypto'
import axios from 'axios'
import { badRequest } from '../lib/errors'
import { logger } from '../lib/logger'

const PAYHERO_BASE_URL = 'https://backend.payhero.co.ke/api/v2'

function getAuthHeader(): string {
  const username = process.env.PAYHERO_USERNAME ?? ''
  const password = process.env.PAYHERO_PASSWORD ?? ''
  const encoded = Buffer.from(`${username}:${password}`).toString('base64')
  return `Basic ${encoded}`
}

export interface PayHeroStkResponse {
  success: boolean
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

export async function initiateStkPush(params: {
  amount: number
  phone: string
  orderId: string
  description: string
}): Promise<PayHeroStkResponse> {
  const channelId = Number(process.env.PAYHERO_CHANNEL_ID)
  const callbackUrl = `${process.env.API_BASE_URL}/v1/payments/callback`

  const response = await axios.post<PayHeroStkResponse>(
    `${PAYHERO_BASE_URL}/payments`,
    {
      amount: params.amount,
      phone_number: params.phone,
      channel_id: channelId,
      provider: 'm-pesa',
      external_reference: params.orderId,
      description: params.description,
      callback_url: callbackUrl,
    },
    {
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  )

  if (!response.data.CheckoutRequestID) {
    logger.error('PayHero STK push failed', { data: response.data })
    throw new Error('PayHero STK push did not return a CheckoutRequestID')
  }

  return response.data
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.PAYHERO_WEBHOOK_SECRET ?? ''
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected, 'hex')
  const receivedBuf = Buffer.from(signature, 'hex')

  if (expectedBuf.length !== receivedBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, receivedBuf)
}

export function normalizeKenyanPhone(phone: string): string {
  // Strip spaces and dashes
  let normalized = phone.replace(/[\s-]/g, '')

  if (normalized.startsWith('+254')) {
    normalized = normalized.slice(1) // remove +
  } else if (normalized.startsWith('07') || normalized.startsWith('01')) {
    normalized = `254${normalized.slice(1)}`
  }
  // If already 254XXXXXXXXX, leave as-is

  if (!/^254[0-9]{9}$/.test(normalized)) {
    throw badRequest('Invalid Kenyan phone number. Must be 07XXXXXXXX or +254XXXXXXXXX', {
      phone,
    })
  }

  return normalized
}
