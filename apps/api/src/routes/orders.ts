import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { db, orders, orderItems, orderStatusHistory, cartSessions, cartItems, products, payments } from '@bedo-fish/db'
import { eq, and, desc } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { badRequest, notFound } from '../lib/errors'
import { generateOrderRef } from '../lib/orderRef'
import { authLimiter } from '../middleware/rateLimit'

const router = Router()

const FREE_DELIVERY_THRESHOLD = 1500
const DELIVERY_FEE = 150

const deliverySchema = z.object({
  d_first_name: z.string().min(1, 'Required'),
  d_last_name: z.string().min(1, 'Required'),
  d_phone: z.string().regex(/^07[0-9]{8}$/, 'Enter a valid Kenyan number (07XXXXXXXX)'),
  d_email: z.string().email(),
  d_address: z.string().min(5, 'Please enter your full address'),
  d_city: z.string().min(1, 'Required'),
  d_area: z.string().optional(),
  d_notes: z.string().optional(),
  delivery_zone_id: z.string().uuid().optional(),
})

// POST /orders
router.post('/', requireAuth, authLimiter, validate(deliverySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id
    const delivery = req.body as z.infer<typeof deliverySchema>

    // Load cart
    const sessionRows = await db
      .select()
      .from(cartSessions)
      .where(eq(cartSessions.userId, userId))
      .limit(1)

    if (sessionRows.length === 0) {
      next(badRequest('Your cart is empty'))
      return
    }

    const cartItemRows = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        name: products.name,
        sizeVariant: products.sizeVariant,
        priceKes: products.priceKes,
        isActive: products.isActive,
        stockQty: products.stockQty,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartSessionId, sessionRows[0].id))

    if (cartItemRows.length === 0) {
      next(badRequest('Your cart is empty'))
      return
    }

    // Verify all products are active
    const inactive = cartItemRows.filter((i) => !i.isActive)
    if (inactive.length > 0) {
      next(badRequest(`Some products are no longer available: ${inactive.map((i) => i.name).join(', ')}`))
      return
    }

    // Generate reference and compute totals
    const reference = await generateOrderRef()
    const subtotal = cartItemRows.reduce((sum, i) => sum + parseFloat(i.priceKes) * i.quantity, 0)
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
    const total = subtotal + deliveryFee

    // DB transaction
    const order = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(orders)
        .values({
          reference,
          userId,
          status: 'pending',
          subtotalKes: subtotal.toFixed(2),
          deliveryFeeKes: deliveryFee.toFixed(2),
          totalKes: total.toFixed(2),
          deliveryZoneId: delivery.delivery_zone_id ?? null,
          dFirstName: delivery.d_first_name,
          dLastName: delivery.d_last_name,
          dPhone: delivery.d_phone,
          dEmail: delivery.d_email,
          dAddress: delivery.d_address,
          dCity: delivery.d_city,
          dArea: delivery.d_area ?? null,
          dNotes: delivery.d_notes ?? null,
        })
        .returning()

      // Snapshot order items at time of order
      for (const item of cartItemRows) {
        const lineTotal = parseFloat(item.priceKes) * item.quantity
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          productName: item.name,
          productSize: item.sizeVariant,
          unitPriceKes: item.priceKes,
          quantity: item.quantity,
          lineTotalKes: lineTotal.toFixed(2),
        })
      }

      // Initial status history
      await tx.insert(orderStatusHistory).values({
        orderId: newOrder.id,
        fromStatus: null,
        toStatus: 'pending',
        note: 'Order created',
        changedBy: userId,
      })

      // Clear cart
      await tx.delete(cartItems).where(eq(cartItems.cartSessionId, sessionRows[0].id))

      return newOrder
    })

    res.status(201).json({ success: true, data: { order, reference } })
  } catch (err) {
    next(err)
  }
})

// GET /orders
router.get('/', requireAuth, authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Number(req.query.limit) || 10)
    const offset = (page - 1) * limit

    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, req.user!.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset)

    res.json({ success: true, data: rows, meta: { page, total: rows.length, pages: 1 } })
  } catch (err) {
    next(err)
  }
})

// GET /orders/:reference
router.get('/:reference', requireAuth, authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reference = req.params.reference as string

    const orderRows = await db
      .select()
      .from(orders)
      .where(and(eq(orders.reference, reference), eq(orders.userId, req.user!.id)))
      .limit(1)

    if (orderRows.length === 0) {
      next(notFound('Order not found'))
      return
    }

    const order = orderRows[0]

    const [items, latestPayment] = await Promise.all([
      db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
      db
        .select()
        .from(payments)
        .where(eq(payments.orderId, order.id))
        .orderBy(desc(payments.initiatedAt))
        .limit(1),
    ])

    res.json({ success: true, data: { ...order, items, payment: latestPayment[0] ?? null } })
  } catch (err) {
    next(err)
  }
})

// PATCH /orders/:id/cancel
router.patch('/:id/cancel', requireAuth, authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const reason = typeof req.body.reason === 'string' ? req.body.reason : 'Cancelled by customer'

    const orderRows = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, req.user!.id)))
      .limit(1)

    if (orderRows.length === 0) {
      next(notFound('Order not found'))
      return
    }

    const order = orderRows[0]
    const cancellableStatuses = ['pending', 'payment_pending']
    if (!cancellableStatuses.includes(order.status)) {
      next(badRequest(`Order cannot be cancelled in status: ${order.status}`))
      return
    }

    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({ status: 'cancelled', cancelledAt: new Date(), cancelReason: reason, updatedAt: new Date() })
        .where(eq(orders.id, id))

      await tx.insert(orderStatusHistory).values({
        orderId: id,
        fromStatus: order.status,
        toStatus: 'cancelled',
        note: reason,
        changedBy: req.user!.id,
      })
    })

    res.json({ success: true, data: { cancelled: true } })
  } catch (err) {
    next(err)
  }
})

export default router
