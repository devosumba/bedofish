import { create } from 'zustand'

export type CheckoutStep =
  | 'cart'
  | 'details'
  | 'payment'
  | 'mpesa_pending'
  | 'confirmation'

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

interface CheckoutStore {
  step: CheckoutStep
  deliveryInfo: DeliveryInfo | null
  paymentMethod: 'mpesa' | 'card' | 'paypal'
  orderId: string | null
  orderReference: string | null
  paymentId: string | null

  setStep: (step: CheckoutStep) => void
  setDeliveryInfo: (info: DeliveryInfo) => void
  setPaymentMethod: (method: 'mpesa' | 'card' | 'paypal') => void
  setOrder: (orderId: string, reference: string) => void
  setPaymentId: (id: string) => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  step: 'cart',
  deliveryInfo: null,
  paymentMethod: 'mpesa',
  orderId: null,
  orderReference: null,
  paymentId: null,

  setStep: (step) => set({ step }),
  setDeliveryInfo: (info) => set({ deliveryInfo: info }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setOrder: (orderId, reference) => set({ orderId, orderReference: reference }),
  setPaymentId: (id) => set({ paymentId: id }),
  reset: () =>
    set({
      step: 'cart',
      deliveryInfo: null,
      paymentMethod: 'mpesa',
      orderId: null,
      orderReference: null,
      paymentId: null,
    }),
}))
