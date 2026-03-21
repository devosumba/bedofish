'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const MAX_LOADER_MS = 2000

export function SplashLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [fadingOut, setFadingOut] = useState(false)

  const dismiss = () => {
    setFadingOut(true)
    setTimeout(() => setVisible(false), 300)
  }

  useEffect(() => {
    if (document.readyState === 'complete') {
      const timer = setTimeout(dismiss, 400)
      return () => clearTimeout(timer)
    }

    const maxTimer = setTimeout(dismiss, MAX_LOADER_MS)

    const handleLoad = () => {
      clearTimeout(maxTimer)
      dismiss()
    }

    window.addEventListener('load', handleLoad)
    return () => {
      clearTimeout(maxTimer)
      window.removeEventListener('load', handleLoad)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [prevPath, setPrevPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== prevPath) {
      setPrevPath(pathname)
      setVisible(true)
      setFadingOut(false)

      const timer = setTimeout(dismiss, MAX_LOADER_MS)
      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300"
      style={{
        background: 'rgba(6, 16, 31, 0.97)',
        opacity: fadingOut ? 0 : 1,
        pointerEvents: fadingOut ? 'none' : 'all',
      }}
      aria-label="Loading Bedo Fish"
      role="status"
      aria-live="polite"
    >
      <Image
        src="/bedo-loader.gif"
        alt="Loading"
        width={120}
        height={120}
        className="object-contain"
        unoptimized
        priority
      />
    </div>
  )
}
