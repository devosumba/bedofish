import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { AppError } from './lib/errors'
import { logger } from './lib/logger'
import { redis } from './lib/redis'
import { startSmsWorker } from './jobs/smsQueue'
import productsRouter from './routes/products'
import cartRouter from './routes/cart'
import ordersRouter from './routes/orders'
import paymentsRouter from './routes/payments'

const app = express()
const PORT = process.env.PORT ?? 4000

// Security headers
app.use(
  helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
)

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map((o) => o.trim())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

// Request logging
app.use(morgan('combined'))

// PayHero webhook needs raw Buffer for HMAC verification — must be before express.json()
app.use('/v1/payments/callback', express.raw({ type: 'application/json' }))

// JSON body parsing for all other routes
app.use(express.json())

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'bedo-fish-api', timestamp: new Date().toISOString() })
})

// API routes
app.use('/v1/products', productsRouter)
app.use('/v1/cart', cartRouter)
app.use('/v1/orders', ordersRouter)
app.use('/v1/payments', paymentsRouter)

// 404 catch-all
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Route not found' })
})

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
    return
  }

  logger.error('Unhandled error', { error: err instanceof Error ? err.message : String(err) })
  res.status(500).json({ success: false, error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' })
})

// Connect Redis and start workers
redis.connect().catch((err) => {
  logger.warn('Redis connect warning', { error: err.message })
})

const smsWorker = startSmsWorker()

// Graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`Bedo Fish API running on port ${PORT}`)
})

const shutdown = async () => {
  logger.info('Shutting down gracefully...')
  server.close(async () => {
    await smsWorker.close()
    await redis.quit()
    logger.info('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => { void shutdown() })
process.on('SIGINT', () => { void shutdown() })

export default app
