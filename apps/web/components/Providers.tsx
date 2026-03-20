'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: { border: '1px solid #1B7A4F', color: '#0F4A30' },
            },
            error: {
              style: { border: '1px solid #E24B4B', color: '#7B0000' },
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  )
}
