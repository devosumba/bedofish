'use client'

import { useEffect } from 'react'
import { GoogleSignInButton } from './GoogleSignInButton'

interface Props {
  isOpen: boolean
  onClose: () => void
  callbackUrl?: string
}

export function SignInModal({ isOpen, onClose, callbackUrl }: Props) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="min-h-[500px] bg-black/45 flex items-center justify-center rounded-2xl"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-sm w-full rounded-2xl p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fish logo mark */}
        <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true">
            <ellipse cx="12" cy="10" rx="10" ry="7" fill="white" />
            <circle cx="8" cy="8" r="1.5" fill="#F4911E" />
            <path d="M22 10 L28 5 L28 15 Z" fill="white" />
            <path d="M16 4 Q20 10 16 16" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <h2 className="font-display text-[22px] text-navy font-bold mb-2">
          Sign in to Bedo Fish
        </h2>
        <p className="text-gray-600 text-sm font-body mb-6 leading-6">
          Tap your Google account to continue.
          <br />
          No password needed.
        </p>

        <GoogleSignInButton
          fullWidth
          callbackUrl={callbackUrl ?? '/checkout/details'}
        />

        <button
          onClick={onClose}
          className="mt-4 text-gray-400 text-xs font-body underline hover:text-gray-600 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
