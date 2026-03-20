import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { db, orders, payments, orderStatusHistory } from '@bedo-fish/db'
import { eq, and, desc } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { paymentLimiter, authLimiter } from '../middleware/rateLimit'
import { badRequest, notFound } from '../lib/errors'
import { initiateStkPush, verifyWebhookSignature, normalizeKenyanPhone } from '../services/payHero'
import { enqueueSmsNotification } from '../jobs/smsQueue'
import { logger } from '../lib/logger'

const router = Router()

const initiateSchema = z.object({
  orderId: z.string().uuid(),
  phone: z.string().min(1, 'Phone required'),
})

// POST /payments/initiate
router.post('/initiate', requireAuth, paymentLimiter, validate(initiateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, phone } = req.body as z.infer<typeof initiateSchema>
    const normalizedPhone = normalizeKenyanPhone(phone)

    // Verify order belongs to user and is in correct state
    const orderRows = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, req.user!.id)))
      .limit(1)

    if (orderRows.length === 0) {
      next(notFound('Order not found'))
      return
    }

    const order = orderRows[0]
    if (order.status !== 'pending') {
      next(badRequest(`Order is already in status: ${order.status}`))
      return
    }

    const amount = Math.round(parseFloat(order.totalKes))

    const stkResponse = await initiateStkPush({
      amount,
      phone: normalizedPhone,
      orderId: order.id,
      description: `Bedo Fish order ${order.reference}`,
    })

    const result = await db.transaction(async (tx) => {
      const [payment] = await tx
        .insert(payments)
        .values({
          orderId: order.id,
          provider: 'payhero',
          method: 'mpesa',
          status: 'initiated',
          amountKes: amount.toString(),
          mpesaPhone: normalizedPhone,
          payheroRef: stkResponse.CheckoutRequestID,
          payheroPayload: stkResponse as unknown as Record<string, unknown>,
        })
        .returning()

      await tx
        .update(orders)
        .set({ status: 'payment_pending', updatedAt: new Date() })
        .where(eq(orders.id, order.id))

      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        fromStatus: 'pending',
        toStatus: 'payment_pending',
        note: `M-Pesa STK push initiated to ${normalizedPhone}`,
        changedBy: req.user!.id,
      })

      return payment
    })

    res.json({ success: true, data: { paymentId: result.id, payheroRef: stkResponse.CheckoutRequestID } })
  } catch (err) {
    next(err)
  }
})

// POST /payments/callback — No auth, HMAC only
// NOTE: This route uses express.raw() body parser set in index.ts
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-payhero-signature'] as string

    if (!signature || !verifyWebhookSignature(req.body as Buffer, signature)) {
      logger.warn('Invalid PayHero webhook signature')
      res.sendStatus(401)
      return
    }

    let payload: Record<string, unknown>
    try {
      payload = JSON.parse((req.body as Buffer).toString())
    } catch {
      logger.warn('Invalid PayHero webhook JSON payload')
      res.sendStatus(200) // still 200 to stop retries
      return
    }

    const checkoutRequestId = payload['CheckoutRequestID'] as string
    const mpesaReceipt = payload['MpesaReceiptNumber'] as string
    const callbackStatus = payload['Status'] as string | undefined
    const resultCode = payload['ResultCode'] as string | number | undefined

    // Find payment by payhero_ref
    const paymentRows = await db
      .select()
      .from(payments)
      .where(eq(payments.payheroRef, checkoutRequestId))
      .limit(1)

    if (paymentRows.length === 0) {
      logger.warn('PayHero callback: payment not found', { checkoutRequestId })
      res.sendStatus(200)
      return
    }

    const payment = paymentRows[0]

    // Idempotency — already confirmed
    if (payment.status === 'confirmed') {
      res.sendStatus(200)
      return
    }

    const isSuccess = resultCode === 0 || resultCode === '0' || callbackStatus === 'Success'

    await db.transaction(async (tx) => {
      if (isSuccess) {
        await tx
          .update(payments)
          .set({
            status: 'confirmed',
            mpesaReceipt: mpesaReceipt ?? null,
            confirmedAt: new Date(),
            callbackPayload: payload as Record<string, unknown>,
          })
          .where(eq(payments.id, payment.id))

        await tx
          .update(orders)
          .set({ status: 'paid', updatedAt: new Date() })
          .where(eq(orders.id, payment.orderId))

        await tx.insert(orderStatusHistory).values({
          orderId: payment.orderId,
          fromStatus: 'payment_pending',
          toStatus: 'paid',
          note: `M-Pesa payment confirmed. Receipt: ${mpesaReceipt}`,
        })
      } else {
        const failureReason = payload['ResultDesc'] as string | undefined
        await tx
          .update(payments)
          .set({
            status: 'failed',
            failedAt: new Date(),
            failureReason: failureReason ?? 'Payment failed',
            callbackPayload: payload as Record<string, unknown>,
          })
          .where(eq(payments.id, payment.id))

        await tx
          .update(orders)
          .set({ status: 'pending', updatedAt: new Date() })
          .where(eq(orders.id, payment.orderId))

        await tx.insert(orderStatusHistory).values({
          orderId: payment.orderId,
          fromStatus: 'payment_pending',
          toStatus: 'pending',
          note: failureReason ?? 'Payment failed',
        })
      }
    })

    // Enqueue SMS on success
    if (isSuccess) {
      await enqueueSmsNotification(payment.orderId).catch((err) => {
        logger.error('Failed to enqueue SMS', { error: err.message })
      })
    }

    // Always 200
    res.sendStatus(200)
  } catch (err) {
    logger.error('PayHero callback error', { error: err instanceof Error ? err.message : String(err) })
    // Still 200 — PayHero must not retry indefinitely on our errors
    res.sendStatus(200)
  }
})

// GET /payments/:orderId/status
router.get('/:orderId/status', requireAuth, authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId as string

    // Verify order belongs to user
    const orderRows = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, req.user!.id)))
      .limit(1)

    if (orderRows.length === 0) {
      next(notFound('Order not found'))
      return
    }

    const paymentRows = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .orderBy(desc(payments.initiatedAt))
      .limit(1)

    if (paymentRows.length === 0) {
      res.json({ success: true, data: { status: 'no_payment', orderId } })
      return
    }

    const p = paymentRows[0]
    res.json({
      success: true,
      data: {
        status: p.status,
        paymentId: p.id,
        payheroRef: p.payheroRef,
        mpesaReceipt: p.mpesaReceipt,
        failureReason: p.failureReason,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
