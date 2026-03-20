import Link from 'next/link'
import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  href?: string
}

const variantClasses = {
  primary: 'bg-orange text-white hover:bg-orange-dark border-transparent',
  secondary: 'bg-white text-navy border-navy hover:bg-navy hover:text-white',
  ghost: 'bg-transparent text-white border-white/30 hover:bg-white/10',
  danger: 'bg-transparent text-[#E24B4B] border-[#E24B4B] hover:bg-[#E24B4B] hover:text-white',
}

const sizeClasses = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-7 py-3.5 text-base rounded-xl',
}

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
)

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      href,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const classes = clsx(
      'inline-flex items-center justify-center gap-2 font-body font-medium border-[1.5px] transition-all duration-150',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      (loading || disabled) && 'opacity-50 pointer-events-none',
      className
    )

    if (href) {
      return (
        <Link href={href} className={classes}>
          {loading ? <Spinner /> : children}
        </Link>
      )
    }

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {loading ? <Spinner /> : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
