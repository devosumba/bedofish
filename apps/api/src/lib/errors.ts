export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const notFound = (msg: string): AppError =>
  new AppError(404, 'NOT_FOUND', msg)

export const unauthorized = (): AppError =>
  new AppError(401, 'UNAUTHORIZED', 'Auth required')

export const forbidden = (): AppError =>
  new AppError(403, 'FORBIDDEN', 'Insufficient permissions')

export const badRequest = (msg: string, details?: Record<string, unknown>): AppError =>
  new AppError(400, 'BAD_REQUEST', msg, details)
