import { Request, Response, NextFunction } from 'express'
import { db, sessions, users } from '@bedo-fish/db'
import { eq } from 'drizzle-orm'
import { unauthorized, forbidden } from '../lib/errors'
import type { User } from '@bedo-fish/db'

// Extend Express Request to carry authenticated user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: User | null
    }
  }
}

async function resolveUser(req: Request): Promise<User | null> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null

  const sessionToken = authHeader.slice(7)
  if (!sessionToken) return null

  const now = new Date()
  const sessionRows = await db
    .select({ userId: sessions.userId, expires: sessions.expires })
    .from(sessions)
    .where(eq(sessions.sessionToken, sessionToken))
    .limit(1)

  if (sessionRows.length === 0 || sessionRows[0].expires < now) return null

  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionRows[0].userId))
    .limit(1)

  if (userRows.length === 0) return null
  return userRows[0]
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const user = await resolveUser(req)
  if (!user) {
    next(unauthorized())
    return
  }
  if (!user.isActive) {
    next(unauthorized())
    return
  }
  req.user = user
  next()
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const user = await resolveUser(req)
  if (!user || !user.isActive) {
    next(unauthorized())
    return
  }
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    next(forbidden())
    return
  }
  req.user = user
  next()
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const user = await resolveUser(req)
  req.user = user && user.isActive ? user : null
  next()
}
