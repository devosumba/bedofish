import IORedis from 'ioredis'
import { logger } from './logger'

const redisUrl = process.env.REDIS_URL ?? process.env.REDIS_URL_LOCAL ?? 'redis://localhost:6379'

export const redis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
})

redis.on('error', (err) => {
  logger.error('Redis connection error', { error: err.message })
})

redis.on('connect', () => {
  logger.info('Redis connected')
})
