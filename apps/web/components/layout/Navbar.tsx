'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { useState } from 'react'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { useCartStore } from '@/store/cartStore'
import { UserMenu } from '@/components/auth/UserMenu'

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Our Story', href: '/#our-story' },
  { label: 'Impact', href: '/#impact' },
  { label: 'Invest', href: '/#invest' },
]

export function Navbar() {
  const pathname = usePathname()
  const scrollY = useScrollPosition()
  const { data: session, status } = useSession()
  const toggleCart = useCartStore((s) => s.toggleCart)
  const itemCount = useCartStore((s) => s.itemCount())
  const [mobileOpen, setMobileOpen] = useState(false)

  const isHomepage = pathname === '/'
  const isTransparent = isHomepage && scrollY <= 80

  return (
    <>
      <nav
        className={`relative sticky top-0 z-50 h-[60px] flex items-center justify-between px-6 lg:px-10 transition-colors duration-300 ${
          isTransparent ? 'bg-transparent' : 'bg-navy'
        }`}
      >
        {/* Left: Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/images/bedo-nav-logo.png"
            alt="Bedo Fish"
            width={150}
            height={44}
            className="object-contain w-auto h-10"
            priority
          />
        </Link>

        {/* Center: Nav links — absolutely centered in navbar */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-body text-[13px] font-medium text-white/65 hover:text-white transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Auth + Cart */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Cart button */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-1.5 bg-orange text-white font-body text-sm px-4 py-2 rounded-lg hover:bg-orange-dark transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="bg-white text-orange font-bold text-[11px] rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none">
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth section */}
          {status === 'loading' ? (
            <div className="w-20 h-8 bg-white/10 rounded-lg animate-pulse" />
          ) : session ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="border-[1.5px] border-white/30 rounded-lg px-4 py-2 text-white font-body text-sm hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                  <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                  <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[60px] left-0 right-0 bg-navy z-40 border-t border-white/10">
          <div className="px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-body text-sm text-white/70 hover:text-white transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
            {!session && (
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="text-left font-body text-sm text-white/70 hover:text-white transition-colors py-1"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
