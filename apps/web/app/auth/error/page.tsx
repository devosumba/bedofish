'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 max-w-sm w-full text-center shadow-xl">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="font-display text-2xl text-navy font-bold mb-2">Sign-in error</h1>
        <p className="text-gray-400 text-sm font-body mb-1">
          {error === 'OAuthAccountNotLinked'
            ? 'This email is linked to another account.'
            : error === 'AccessDenied'
            ? 'Access was denied.'
            : 'Something went wrong during sign-in.'}
        </p>
        {error && (
          <p className="text-gray-400 text-xs font-body mb-6 font-mono bg-gray-100 rounded px-2 py-1 inline-block">
            {error}
          </p>
        )}
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full bg-orange text-white font-body font-medium text-sm py-3 rounded-xl hover:bg-orange-dark transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy" />}>
      <ErrorContent />
    </Suspense>
  )
}
