import { Queue, Worker } from 'bullmq'
import { db, orders, users } from '@bedo-fish/db'
import { eq } from 'drizzle-orm'
import { sendOrderConfirmationSms } from '../services/sms'
import { logger } from '../lib/logger'

const redisConnection = { url: process.env.REDIS_URL ?? process.env.REDIS_URL_LOCAL ?? 'redis://localhost:6379' }

export const smsQueue = new Queue('sms-notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
})

export interface SmsJobData {
  orderId: string
}

export async function enqueueSmsNotification(orderId: string): Promise<void> {
  await smsQueue.add('order-confirmed-sms', { orderId } satisfies SmsJobData)
}

export function startSmsWorker(): Worker {
  const worker = new Worker<SmsJobData>(
    'sms-notifications',
    async (job) => {
      const { orderId } = job.data

      const orderRows = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1)

      if (orderRows.length === 0) {
        logger.warn('SMS job: order not found', { orderId })
        return
      }

      const order = orderRows[0]

      let phone = order.dPhone
      let firstName = order.dFirstName

      // Try to get user's stored phone if order phone is missing
      if (order.userId) {
        const userRows = await db
          .select({ phone: users.phone })
          .from(users)
          .where(eq(users.id, order.userId))
          .limit(1)

        if (userRows.length > 0 && userRows[0].phone) {
          phone = userRows[0].phone
        }
      }

      await sendOrderConfirmationSms({
        phone,
        firstName,
        reference: order.reference,
        total: order.totalKes,
      })
    },
    { connection: redisConnection }
  )

  worker.on('completed', (job) => {
    logger.info('SMS job completed', { jobId: job.id })
  })

  worker.on('failed', (job, err) => {
    logger.error('SMS job failed', { jobId: job?.id, error: err.message })
  })

  return worker
}
