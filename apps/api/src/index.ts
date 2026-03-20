import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'

const app = express()
const PORT = process.env.PORT ?? 4000

// Security headers
app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true },
}))

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',')
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// Request logging
app.use(morgan('combined'))

// Body parsing (default for most routes)
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bedo-fish-api', timestamp: new Date().toISOString() })
})

// Placeholder v1 router
app.get('/v1/products', (_req, res) => {
  res.json({ data: [], meta: { page: 1, total: 0, pages: 0 } })
})

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' })
})

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' })
})

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`Bedo Fish API running on port ${PORT}`)
})

const shutdown = () => {
  server.close(() => {
    console.log('Server closed gracefully')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

export default app
