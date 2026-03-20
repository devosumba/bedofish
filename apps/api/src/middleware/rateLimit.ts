import rateLimit from 'express-rate-limit'

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
})

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
})

export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many payment requests, please wait before trying again' },
})
