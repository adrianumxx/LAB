import { cn } from '@/lib/utils'
import React from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex min-h-11 h-11 w-full rounded-md border border-border bg-surface px-4 py-2 text-sm',
        'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors duration-base',
        'dark:border-border dark:bg-neutral-800',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
