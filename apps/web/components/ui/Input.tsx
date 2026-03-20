import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-body font-medium text-gray-600 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-3.5 py-2.5 border-[1.5px] rounded-lg font-body text-sm text-navy bg-white placeholder:text-gray-400 focus:outline-none transition-colors duration-200',
            error
              ? 'border-red-400 focus:border-red-400'
              : 'border-gray-200 focus:border-navy',
            props.disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200',
            className
          )}
          {...props}
        />
        {error && (
          <p className="flex items-center gap-1 mt-1 text-xs font-body text-red-500">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 4a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 016 5zm0-1.5a.75.75 0 110-1.5.75.75 0 010 1.5z" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1 text-[11px] font-body text-gray-400">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
