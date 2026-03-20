// Shared TypeScript types for Bedo Fish platform

export type UserRole = 'customer' | 'admin' | 'super_admin'

export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'processing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'initiated' | 'pending' | 'confirmed' | 'failed' | 'refunded'

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
  metaTitle: string | null
  metaDesc: string | null
  createdAt: string
  updatedAt: string
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

export interface OrderItem {
  id: string
  orderId: string
  productId: string | null
  productName: string
  productSize: string
  unitPriceKes: string
  quantity: number
  lineTotalKes: string
}

export interface Order {
  id: string
  reference: string
  userId: string | null
  status: OrderStatus
  subtotalKes: string
  deliveryFeeKes: string
  totalKes: string
  dFirstName: string
  dLastName: string
  dPhone: string
  dEmail: string
  dAddress: string
  dCity: string
  dArea: string | null
  dNotes: string | null
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
  payment?: Payment | null
}

export interface Payment {
  id: string
  orderId: string
  status: PaymentStatus
  amountKes: string
  payheroRef: string | null
  mpesaReceipt: string | null
  mpesaPhone: string | null
  failureReason: string | null
  initiatedAt: string
  confirmedAt: string | null
  failedAt: string | null
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

export interface CreateOrderData {
  d_first_name: string
  d_last_name: string
  d_phone: string
  d_email: string
  d_address: string
  d_city: string
  d_area?: string
  d_notes?: string
  delivery_zone_id?: string
}

export interface CreateOrderResponse {
  order: Order
  reference: string
}

export interface PaymentInitResponse {
  paymentId: string
  payheroRef: string
}

export interface PaymentStatusResponse {
  status: PaymentStatus | 'no_payment'
  paymentId?: string
  payheroRef?: string | null
  mpesaReceipt?: string | null
  failureReason?: string | null
  orderId?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    total: number
    pages: number
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
