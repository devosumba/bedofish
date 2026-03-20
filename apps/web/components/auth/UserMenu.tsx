'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

export function UserMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!session?.user) return null

  const firstName = session.user.name?.split(' ')[0] ?? 'Account'
  const initial = firstName[0]?.toUpperCase() ?? 'A'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 cursor-pointer"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={firstName}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange flex items-center justify-center">
            <span className="text-white text-xs font-body font-bold">{initial}</span>
          </div>
        )}
        <span className="text-white text-sm font-body">{firstName}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[144px] z-50">
          <button
            onClick={() => { setOpen(false); router.push('/orders') }}
            className="w-full text-left px-4 py-2 text-navy text-sm font-body hover:bg-gray-100 transition-colors"
          >
            My Orders
          </button>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full text-left px-4 py-2 text-sm font-body text-gray-600 hover:text-[#E24B4B] hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
