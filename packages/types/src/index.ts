// Shared TypeScript types for Bedo Fish platform

export interface Product {
  id: string
  name: string
  slug: string
  sizeVariant: string
  description: string | null
  priceKes: string
  originalPrice: string | null
  stockQty: number
  sku: string | null
  badge: string | null
  imageUrl: string | null
  imageUrls: string[] | null
  isActive: boolean
  isFeatured: boolean
  weightGrams: number | null
  sortOrder: number
  categoryId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  isActive: boolean
}

export interface CartItem {
  id: string
  productId: string
  name: string
  size: string
  price: string
  quantity: number
  imageUrl: string | null
}

export interface Cart {
  items: CartItem[]
  subtotal: string
  deliveryFee: string
  total: string
  itemCount: number
}

export interface DeliveryInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  area?: string
  notes?: string
}

export interface Order {
  id: string
  reference: string
  status: OrderStatus
  subtotalKes: string
  deliveryFeeKes: string
  totalKes: string
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type UserRole = 'customer' | 'admin' | 'super_admin'

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    total: number
    pages: number
  }
}
