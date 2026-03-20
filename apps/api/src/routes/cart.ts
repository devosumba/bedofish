import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { db, cartSessions, cartItems, products } from '@bedo-fish/db'
import { eq, and } from 'drizzle-orm'
import { redis } from '../lib/redis'
import { requireAuth, optionalAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { badRequest, notFound } from '../lib/errors'

const router = Router()

const GUEST_TTL = 86400
const FREE_DELIVERY_THRESHOLD = 1500
const DELIVERY_FEE = 150

interface CartItemResponse {
  id: string
  productId: string
  name: string
  size: string
  price: string
  quantity: number
  imageUrl: string | null
}

interface CartResponse {
  items: CartItemResponse[]
  subtotal: string
  deliveryFee: string
  total: string
  itemCount: number
}

function computeCartTotals(items: CartItemResponse[]): Omit<CartResponse, 'items'> {
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  return {
    subtotal: subtotal.toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    total: (subtotal + deliveryFee).toFixed(2),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  }
}

async function getDbCart(userId: string): Promise<CartItemResponse[]> {
  const sessionRows = await db
    .select()
    .from(cartSessions)
    .where(eq(cartSessions.userId, userId))
    .limit(1)

  if (sessionRows.length === 0) return []

  const rows = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      size: products.sizeVariant,
      price: products.priceKes,
      imageUrl: products.imageUrl,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartSessionId, sessionRows[0].id))

  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    name: r.name,
    size: r.size,
    price: r.price,
    quantity: r.quantity,
    imageUrl: r.imageUrl,
  }))
}

async function getGuestCart(sessionId: string): Promise<CartItemResponse[]> {
  const data = await redis.hgetall(`cart:guest:${sessionId}`)
  if (!data || Object.keys(data).length === 0) return []
  return Object.values(data).map((v) => JSON.parse(v) as CartItemResponse)
}

// GET /cart
router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    let items: CartItemResponse[]

    if (req.user) {
      items = await getDbCart(req.user.id)
    } else {
      const sessionId = req.headers['x-session-id'] as string
      items = sessionId ? await getGuestCart(sessionId) : []
    }

    const totals = computeCartTotals(items)
    res.json({ success: true, data: { items, ...totals } })
  } catch (err) {
    next(err)
  }
})

// POST /cart/items
router.post(
  '/items',
  optionalAuth,
  validate(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, quantity } = req.body as { productId: string; quantity: number }

      const productRows = await db
        .select()
        .from(products)
        .where(and(eq(products.id, productId), eq(products.isActive, true)))
        .limit(1)

      if (productRows.length === 0) {
        next(notFound('Product not found'))
        return
      }
      const product = productRows[0]

      if (product.stockQty < quantity) {
        next(badRequest(`Only ${product.stockQty} units available`))
        return
      }

      if (req.user) {
        // DB cart
        let sessionRows = await db
          .select()
          .from(cartSessions)
          .where(eq(cartSessions.userId, req.user.id))
          .limit(1)

        if (sessionRows.length === 0) {
          sessionRows = await db
            .insert(cartSessions)
            .values({ userId: req.user.id, updatedAt: new Date() })
            .returning()
        }

        const sessionId = sessionRows[0].id
        const existing = await db
          .select()
          .from(cartItems)
          .where(and(eq(cartItems.cartSessionId, sessionId), eq(cartItems.productId, productId)))
          .limit(1)

        if (existing.length > 0) {
          await db
            .update(cartItems)
            .set({ quantity: existing[0].quantity + quantity })
            .where(eq(cartItems.id, existing[0].id))
        } else {
          await db.insert(cartItems).values({ cartSessionId: sessionId, productId, quantity })
        }

        await db
          .update(cartSessions)
          .set({ updatedAt: new Date() })
          .where(eq(cartSessions.id, sessionId))

        const items = await getDbCart(req.user.id)
        const totals = computeCartTotals(items)
        res.json({ success: true, data: { items, ...totals } })
      } else {
        // Guest Redis cart
        const sessionId = req.headers['x-session-id'] as string
        if (!sessionId) {
          next(badRequest('x-session-id header required for guest cart'))
          return
        }

        const key = `cart:guest:${sessionId}`
        const existing = await redis.hget(key, productId)
        const item: CartItemResponse = existing
          ? { ...JSON.parse(existing), quantity: JSON.parse(existing).quantity + quantity }
          : {
              id: productId,
              productId,
              name: product.name,
              size: product.sizeVariant,
              price: product.priceKes,
              quantity,
              imageUrl: product.imageUrl,
            }

        await redis.hset(key, productId, JSON.stringify(item))
        await redis.expire(key, GUEST_TTL)

        const items = await getGuestCart(sessionId)
        const totals = computeCartTotals(items)
        res.json({ success: true, data: { items, ...totals } })
      }
    } catch (err) {
      next(err)
    }
  }
)

// PUT /cart/items/:id
router.put('/items/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const qty = Number(req.body.quantity)
    if (isNaN(qty) || qty < 0) {
      next(badRequest('quantity must be a non-negative integer'))
      return
    }

    if (req.user) {
      if (qty === 0) {
        await db
          .delete(cartItems)
          .where(and(eq(cartItems.id, id)))
      } else {
        await db.update(cartItems).set({ quantity: qty }).where(eq(cartItems.id, id))
      }
      const items = await getDbCart(req.user.id)
      const totals = computeCartTotals(items)
      res.json({ success: true, data: { items, ...totals } })
    } else {
      const sessionId = req.headers['x-session-id'] as string
      if (!sessionId) {
        next(badRequest('x-session-id header required for guest cart'))
        return
      }

      const key = `cart:guest:${sessionId}`
      const existing = await redis.hget(key, id)
      if (!existing) {
        next(notFound('Cart item not found'))
        return
      }

      if (qty === 0) {
        await redis.hdel(key, id)
      } else {
        await redis.hset(key, id, JSON.stringify({ ...JSON.parse(existing), quantity: qty }))
      }
      await redis.expire(key, GUEST_TTL)

      const items = await getGuestCart(sessionId)
      const totals = computeCartTotals(items)
      res.json({ success: true, data: { items, ...totals } })
    }
  } catch (err) {
    next(err)
  }
})

// DELETE /cart/items/:id
router.delete('/items/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string

    if (req.user) {
      await db.delete(cartItems).where(eq(cartItems.id, id))
      const items = await getDbCart(req.user.id)
      const totals = computeCartTotals(items)
      res.json({ success: true, data: { items, ...totals } })
    } else {
      const sessionId = req.headers['x-session-id'] as string
      if (!sessionId) {
        next(badRequest('x-session-id header required for guest cart'))
        return
      }
      await redis.hdel(`cart:guest:${sessionId}`, id)
      const items = await getGuestCart(sessionId)
      const totals = computeCartTotals(items)
      res.json({ success: true, data: { items, ...totals } })
    }
  } catch (err) {
    next(err)
  }
})

// DELETE /cart
router.delete('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      const sessionRows = await db
        .select()
        .from(cartSessions)
        .where(eq(cartSessions.userId, req.user.id))
        .limit(1)

      if (sessionRows.length > 0) {
        await db.delete(cartItems).where(eq(cartItems.cartSessionId, sessionRows[0].id))
      }
    } else {
      const sessionId = req.headers['x-session-id'] as string
      if (sessionId) {
        await redis.del(`cart:guest:${sessionId}`)
      }
    }
    res.json({ success: true, data: { items: [], subtotal: '0.00', deliveryFee: '150.00', total: '150.00', itemCount: 0 } })
  } catch (err) {
    next(err)
  }
})

// POST /cart/merge — merge guest cart into user cart on login
router.post('/merge', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.body.sessionId as string
    if (!sessionId) {
      next(badRequest('sessionId required'))
      return
    }

    const guestItems = await getGuestCart(sessionId)
    if (guestItems.length === 0) {
      const items = await getDbCart(req.user!.id)
      const totals = computeCartTotals(items)
      res.json({ success: true, data: { items, ...totals } })
      return
    }

    // Ensure user has a cart session
    let sessionRows = await db
      .select()
      .from(cartSessions)
      .where(eq(cartSessions.userId, req.user!.id))
      .limit(1)

    if (sessionRows.length === 0) {
      sessionRows = await db
        .insert(cartSessions)
        .values({ userId: req.user!.id, updatedAt: new Date() })
        .returning()
    }

    const cartSessionId = sessionRows[0].id

    for (const guestItem of guestItems) {
      const productRows = await db
        .select()
        .from(products)
        .where(and(eq(products.id, guestItem.productId), eq(products.isActive, true)))
        .limit(1)

      if (productRows.length === 0) continue

      const existing = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.cartSessionId, cartSessionId), eq(cartItems.productId, guestItem.productId)))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(cartItems)
          .set({ quantity: existing[0].quantity + guestItem.quantity })
          .where(eq(cartItems.id, existing[0].id))
      } else {
        await db.insert(cartItems).values({ cartSessionId, productId: guestItem.productId, quantity: guestItem.quantity })
      }
    }

    // Clear guest cart
    await redis.del(`cart:guest:${sessionId}`)

    const items = await getDbCart(req.user!.id)
    const totals = computeCartTotals(items)
    res.json({ success: true, data: { items, ...totals } })
  } catch (err) {
    next(err)
  }
})

export default router
