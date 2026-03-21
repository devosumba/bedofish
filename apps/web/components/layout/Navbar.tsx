'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { useCartStore } from '@/store/cartStore'
import { UserMenu } from '@/components/auth/UserMenu'

function NavLink({
  href,
  children,
  active,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center px-4 py-2 rounded-full
        text-sm font-medium font-body
        transition-all duration-200
        ${active ? 'text-white' : 'text-white/60 hover:text-white'}
      `}
    >
      {active && (
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: '#F4911E' }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const toggleCart = useCartStore((s) => s.toggleCart)
  const itemCount = useCartStore((s) => s.itemCount())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none">
        <nav
          className="pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-full"
          style={{
            background: 'rgba(14, 14, 14, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center px-3 flex-shrink-0">
            <Image
              src="/images/bedo-nav-logo.png"
              alt="Bedo Fish"
              width={120}
              height={36}
              className="object-contain w-auto h-8"
              priority
            />
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center">
            <NavLink href="/shop" active={pathname === '/shop'}>
              Shop
            </NavLink>
            <NavLink href="/#our-story" active={false}>
              Our Story
            </NavLink>
            <NavLink href="/#impact" active={false}>
              Impact
            </NavLink>
            <NavLink href="/#invest" active={false}>
              Invest
            </NavLink>
          </div>

          {/* Separator */}
          <div
            className="hidden md:block w-px h-5 mx-1 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          />

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-full
                       text-white/70 hover:text-white text-sm font-medium font-body
                       transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-label="Open cart"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full
                           flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: '#F4911E' }}
              >
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {status === 'loading' ? (
            <div className="w-16 h-8 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
          ) : session ? (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-full
                         text-white/70 hover:text-white transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <UserMenu />
            </div>
          ) : (
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="px-4 py-2 rounded-full text-sm font-medium font-body
                         text-white/70 hover:text-white transition-all duration-200"
            >
              Sign In
            </button>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9
                       rounded-full text-white/70 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            aria-label="Open menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-start pt-24 px-6"
          style={{
            background: 'rgba(14, 14, 14, 0.97)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full
                       flex items-center justify-center text-white/60
                       hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            ✕
          </button>

          <div className="flex flex-col items-center gap-2 w-full max-w-xs">
            {[
              { href: '/shop', label: 'Shop' },
              { href: '/#our-story', label: 'Our Story' },
              { href: '/#impact', label: 'Impact' },
              { href: '/#invest', label: 'Invest' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-4 rounded-2xl text-lg
                           font-medium font-body text-white/70 hover:text-white
                           transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
