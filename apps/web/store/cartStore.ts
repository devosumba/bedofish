'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'react-hot-toast'
import type { Product } from '@bedo-fish/types'

interface CartItem {
  id: string
  productId: string
  name: string
  size: string
  price: number
  quantity: number
  imageUrl: string | null
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  sessionId: string

  addItem: (product: Product, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Computed
  subtotal: () => number
  deliveryFee: () => number
  total: () => number
  itemCount: () => number
}

function generateSessionId(): string {
  return `guest-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      sessionId: generateSessionId(),

      addItem: (product: Product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                productId: product.id,
                name: product.name,
                size: product.sizeVariant,
                price: parseFloat(product.priceKes),
                quantity: qty,
                imageUrl: product.imageUrl,
              },
            ],
          }
        })
        toast.success(`${product.name} added to cart`, { duration: 2000 })
      },

      removeItem: (productId: string) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }))
      },

      updateQty: (productId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: qty } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      deliveryFee: () => (get().subtotal() >= 1500 ? 0 : 150),
      total: () => get().subtotal() + get().deliveryFee(),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'bedo-fish-cart',
      partialize: (state) => ({
        items: state.items,
        sessionId: state.sessionId,
      }),
    }
  )
)
