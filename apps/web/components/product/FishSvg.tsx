interface FishSvgProps {
  width?: number
  height?: number
  className?: string
}

export function FishSvg({ width = 64, height = 42, className }: FishSvgProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="28" cy="21" rx="22" ry="14" fill="white" opacity="0.9" />
      <circle cx="18" cy="17" r="3" fill="white" opacity="0.5" />
      <circle cx="18" cy="17" r="1.5" fill="rgba(0,0,0,0.15)" />
      <path d="M50 21 L64 10 L64 32 Z" fill="white" opacity="0.85" />
      <path d="M34 9 Q42 21 34 33" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M38 12 Q46 21 38 30" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
    </svg>
  )
}
