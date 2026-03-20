import AfricasTalking from 'africastalking'
import { logger } from '../lib/logger'

interface SmsParams {
  phone: string
  firstName: string
  reference: string
  total: string
}

export async function sendOrderConfirmationSms(params: SmsParams): Promise<void> {
  const { phone, firstName, reference, total } = params

  try {
    const AT = AfricasTalking({
      apiKey: process.env.AT_API_KEY ?? '',
      username: process.env.AT_USERNAME ?? '',
    })

    // Normalize to +254 format
    let normalized = phone.replace(/[\s-]/g, '')
    if (normalized.startsWith('07') || normalized.startsWith('01')) {
      normalized = `+254${normalized.slice(1)}`
    } else if (normalized.startsWith('254')) {
      normalized = `+${normalized}`
    } else if (!normalized.startsWith('+254')) {
      normalized = `+254${normalized}`
    }

    const message = `Bedo Fish: Hi ${firstName}, order ${reference} for KES ${total} is confirmed! Delivery in 2-4hrs. We'll call to confirm. Thanks!`

    const result = await AT.SMS.send({
      to: [normalized],
      message,
      from: process.env.AT_SENDER_ID ?? 'BEDOFISH',
    })

    logger.info('SMS sent successfully', { reference, phone: normalized, result })
  } catch (err) {
    // Never throw — SMS failure must not block order flow
    logger.error('SMS send failed', {
      reference,
      phone,
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
