import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { db, products, categories } from '@bedo-fish/db'
import { eq, and, ilike, sql } from 'drizzle-orm'
import crypto from 'crypto'
import { redis } from '../lib/redis'
import { requireAdmin } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { publicLimiter } from '../middleware/rateLimit'
import { notFound } from '../lib/errors'

const router = Router()

const productCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sizeVariant: z.string().min(1),
  description: z.string().optional(),
  priceKes: z.string().regex(/^\d+(\.\d{1,2})?$/),
  originalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  stockQty: z.number().int().min(0).optional(),
  sku: z.string().optional(),
  badge: z.string().optional(),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  weightGrams: z.number().int().positive().optional(),
  sortOrder: z.number().int().optional(),
  categoryId: z.string().uuid().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
})

// GET /products
router.get('/', publicLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12))
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined
    const categorySlug = typeof req.query.category === 'string' ? req.query.category : undefined

    const cacheKey = `products:list:${crypto.createHash('md5').update(JSON.stringify({ page, limit, search, categorySlug })).digest('hex')}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      res.json(JSON.parse(cached))
      return
    }

    const offset = (page - 1) * limit
    const conditions = [eq(products.isActive, true)]

    if (search) {
      conditions.push(ilike(products.name, `%${search}%`))
    }

    let categoryId: string | undefined
    if (categorySlug) {
      const catRows = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.slug, categorySlug), eq(categories.isActive, true)))
        .limit(1)
      if (catRows.length > 0) categoryId = catRows[0].id
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId))
    }

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(products.sortOrder, products.createdAt)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...conditions)),
    ])

    const total = Number(countRows[0].count)
    const result = {
      success: true,
      data: rows,
      meta: { page, total, pages: Math.ceil(total / limit) },
    }

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// GET /products/featured
router.get('/featured', publicLimiter, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'products:featured'
    const cached = await redis.get(cacheKey)
    if (cached) {
      res.json(JSON.parse(cached))
      return
    }

    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
      .orderBy(products.sortOrder)
      .limit(6)

    const result = { success: true, data: rows }
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// GET /products/:slug
router.get('/:slug', publicLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string
    const cacheKey = `products:slug:${slug}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      res.json(JSON.parse(cached))
      return
    }

    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1)

    if (rows.length === 0) {
      next(notFound(`Product '${slug}' not found`))
      return
    }

    const result = { success: true, data: rows[0] }
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 600)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// POST /products (admin)
router.post('/', requireAdmin, validate(productCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await db.insert(products).values(req.body).returning()
    res.status(201).json({ success: true, data: rows[0] })
  } catch (err) {
    next(err)
  }
})

// PUT /products/:id (admin)
router.put('/:id', requireAdmin, validate(productCreateSchema.partial()), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const rows = await db
      .update(products)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()

    if (rows.length === 0) {
      next(notFound('Product not found'))
      return
    }
    // Invalidate cache
    await redis.del(`products:slug:${rows[0].slug}`)
    await redis.del('products:featured')
    res.json({ success: true, data: rows[0] })
  } catch (err) {
    next(err)
  }
})

// DELETE /products/:id (admin) — soft delete
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string
    const rows = await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning()

    if (rows.length === 0) {
      next(notFound('Product not found'))
      return
    }
    await redis.del(`products:slug:${rows[0].slug}`)
    await redis.del('products:featured')
    res.json({ success: true, data: { deleted: true } })
  } catch (err) {
    next(err)
  }
})

export default router
