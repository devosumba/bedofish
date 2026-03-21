'use client'
import Image from 'next/image'

interface BedoLoaderProps {
  fullScreen?: boolean
  size?: number
}

export function BedoLoader({ fullScreen = false, size = 120 }: BedoLoaderProps) {
  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: 'rgba(6, 16, 31, 0.97)' }}
        aria-label="Loading"
        role="status"
      >
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/bedo-loader.gif"
            alt="Loading Bedo Fish"
            width={size}
            height={size}
            className="object-contain"
            unoptimized
            priority
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full py-12" role="status">
      <Image
        src="/bedo-loader.gif"
        alt="Loading"
        width={size}
        height={size}
        className="object-contain"
        unoptimized
      />
    </div>
  )
}
