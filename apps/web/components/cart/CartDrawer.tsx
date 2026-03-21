'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { SignInModal } from '@/components/auth/SignInModal'
import { FishSvg } from '@/components/product/FishSvg'

export function CartDrawer() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, isOpen, closeCart, removeItem, updateQty } = useCartStore()
  const subtotal = useCartStore((s) => s.subtotal())
  const deliveryFee = useCartStore((s) => s.deliveryFee())
  const total = useCartStore((s) => s.total())
  const itemCount = useCartStore((s) => s.itemCount())
  const [signInOpen, setSignInOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // ESC closes
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, closeCart])

  // Focus trap
  useEffect(() => {
    if (isOpen) drawerRef.current?.focus()
  }, [isOpen])

  function handleCheckout() {
    if (session) {
      closeCart()
      router.push('/checkout/details')
    } else {
      setSignInOpen(true)
    }
  }

  if (!isOpen && !signInOpen) return null

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      {isOpen && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          tabIndex={-1}
          className="fixed right-0 top-0 h-full w-full sm:w-[380px] bg-white z-50 flex flex-col shadow-2xl outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="font-fraunces font-bold text-[20px] text-navy">Your Cart</h2>
            <button
              onClick={closeCart}
              className="text-gray-400 hover:text-navy transition-colors"
              aria-label="Close cart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Items area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                <FishSvg width={48} height={32} className="opacity-20" />
                <p className="text-gray-600 text-[15px] font-body">Your cart is empty</p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="text-orange font-body text-sm font-medium hover:underline"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div className="w-[52px] h-[52px] bg-navy rounded-xl flex-shrink-0 flex items-center justify-center">
                      <FishSvg width={32} height={22} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-navy text-sm font-semibold font-body truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs font-body">{item.size}</p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-navy hover:border-navy transition-colors text-sm"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="text-[15px] font-semibold font-body text-navy w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-navy hover:border-navy transition-colors text-sm"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price + remove */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-navy text-sm font-semibold font-body">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-300 text-sm hover:text-red-400 transition-colors mt-1"
                        aria-label={`Remove ${item.name}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 px-5 py-4 space-y-2">
              <div className="flex justify-between text-[13px] font-body">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-navy">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px] font-body items-center">
                <span className="text-gray-600">Delivery</span>
                <div className="text-right">
                  {deliveryFee === 0 ? (
                    <span className="bg-brand-green-light text-brand-green text-[11px] font-semibold px-2 py-0.5 rounded-full">FREE</span>
                  ) : (
                    <div>
                      <span className="text-navy">KES {deliveryFee}</span>
                      <p className="text-orange text-[10px] mt-0.5">
                        Add KES {(1500 - subtotal).toLocaleString()} for free delivery
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                <span className="text-navy text-base font-semibold font-body">Total</span>
                <span className="text-orange font-display text-[22px] font-bold">
                  KES {total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={itemCount === 0}
                className="w-full bg-orange text-white font-body font-medium py-3 rounded-xl hover:bg-orange-dark transition-colors mt-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                Proceed to Checkout
              </button>

              <div className="text-center">
                <button
                  onClick={closeCart}
                  className="text-gray-400 text-xs font-body underline hover:text-gray-600 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
              <p className="text-gray-400 text-[11px] font-body text-center">
                Secure checkout via M-Pesa or Card
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sign-in modal — shown below the drawer */}
      {signInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <SignInModal
            isOpen={signInOpen}
            onClose={() => setSignInOpen(false)}
            callbackUrl="/checkout/details"
          />
        </div>
      )}
    </>
  )
}
