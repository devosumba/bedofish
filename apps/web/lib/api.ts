import { getSession, signOut } from 'next-auth/react'
import type {
  Product,
  Cart,
  Order,
  CreateOrderData,
  CreateOrderResponse,
  PaymentInitResponse,
  PaymentStatusResponse,
  PaginatedResponse,
  ApiError as ApiErrorType,
} from '@bedo-fish/types'
import { ApiError } from '@bedo-fish/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/v1'

async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = false, ...fetchOptions } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (auth) {
    const session = await getSession()
    if (session) {
      // Auth.js v5 session token is not directly exposed; use session cookie
      // The session token is managed via cookies automatically
    }
  }

  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
    headers,
  })

  if (res.status === 401) {
    await signOut({ callbackUrl: '/' })
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired')
  }

  if (!res.ok) {
    let code = 'UNKNOWN'
    let message = 'An error occurred'
    try {
      const body = await res.json() as { error?: string; message?: string }
      code = body.error ?? code
      message = body.message ?? message
    } catch {
      // ignore parse error
    }
    throw new ApiError(res.status, code, message)
  }

  const json = await res.json() as { success: boolean; data: T }
  return json.data
}

export const api = {
  products: {
    async list(params?: {
      category?: string
      search?: string
      page?: number
      limit?: number
    }): Promise<{ data: Product[]; meta: { page: number; total: number; pages: number } }> {
      const qs = new URLSearchParams()
      if (params?.category) qs.set('category', params.category)
      if (params?.search) qs.set('search', params.search)
      if (params?.page) qs.set('page', String(params.page))
      if (params?.limit) qs.set('limit', String(params.limit))
      const query = qs.toString()
      return apiFetch(`/products${query ? `?${query}` : ''}`)
    },

    async featured(): Promise<Product[]> {
      const result = await apiFetch<Product[]>('/products/featured')
      return result
    },

    async get(slug: string): Promise<Product> {
      return apiFetch(`/products/${encodeURIComponent(slug)}`)
    },
  },

  cart: {
    async get(sessionId?: string): Promise<Cart> {
      const headers: Record<string, string> = {}
      if (sessionId) headers['x-session-id'] = sessionId
      return apiFetch('/cart', { headers })
    },

    async addItem(productId: string, quantity: number, sessionId?: string): Promise<Cart> {
      const headers: Record<string, string> = {}
      if (sessionId) headers['x-session-id'] = sessionId
      return apiFetch('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
        headers,
      })
    },

    async updateItem(itemId: string, quantity: number, sessionId?: string): Promise<Cart> {
      const headers: Record<string, string> = {}
      if (sessionId) headers['x-session-id'] = sessionId
      return apiFetch(`/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
        headers,
      })
    },

    async removeItem(itemId: string, sessionId?: string): Promise<Cart> {
      const headers: Record<string, string> = {}
      if (sessionId) headers['x-session-id'] = sessionId
      return apiFetch(`/cart/items/${itemId}`, { method: 'DELETE', headers })
    },

    async clear(sessionId?: string): Promise<void> {
      const headers: Record<string, string> = {}
      if (sessionId) headers['x-session-id'] = sessionId
      return apiFetch('/cart', { method: 'DELETE', headers })
    },

    async merge(sessionId: string): Promise<Cart> {
      return apiFetch('/cart/merge', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
        auth: true,
      })
    },
  },

  orders: {
    async create(data: CreateOrderData): Promise<CreateOrderResponse> {
      return apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
        auth: true,
      })
    },

    async get(reference: string): Promise<Order> {
      return apiFetch(`/orders/${encodeURIComponent(reference)}`, { auth: true })
    },

    async list(page = 1): Promise<{ data: Order[]; meta: { page: number; total: number; pages: number } }> {
      return apiFetch(`/orders?page=${page}`, { auth: true })
    },

    async cancel(orderId: string): Promise<Order> {
      return apiFetch(`/orders/${orderId}/cancel`, { method: 'PATCH', auth: true })
    },
  },

  payments: {
    async initiate(orderId: string, phone: string): Promise<PaymentInitResponse> {
      return apiFetch('/payments/initiate', {
        method: 'POST',
        body: JSON.stringify({ orderId, phone }),
        auth: true,
      })
    },

    async getStatus(orderId: string): Promise<PaymentStatusResponse> {
      return apiFetch(`/payments/${orderId}/status`, { auth: true })
    },
  },
}
