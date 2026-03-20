import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'orange' | 'navy' | 'green' | 'gray' | 'red'
  size?: 'sm' | 'md'
  className?: string
}

const variantClasses = {
  orange: 'bg-orange/15 text-orange',
  navy: 'bg-navy/10 text-navy',
  green: 'bg-brand-green-light text-brand-green',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-50 text-red-600',
}

const sizeClasses = {
  sm: 'px-2 py-1 text-[9px] tracking-[0.8px]',
  md: 'px-3 py-1.5 text-[10px] tracking-[1.2px]',
}

export function Badge({ children, variant = 'orange', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-body font-semibold uppercase',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}
