import { useEffect, useRef, useState } from 'react'

const MAX_LOADER_MS = 2000

export function useBedoLoader(isLoading: boolean) {
  const [showLoader, setShowLoader] = useState(isLoading)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true)

      timerRef.current = setTimeout(() => {
        setShowLoader(false)
      }, MAX_LOADER_MS)
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      setShowLoader(false)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isLoading])

  return showLoader
}
