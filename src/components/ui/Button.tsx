import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-[color,background-color,box-shadow,transform] duration-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] motion-reduce:active:scale-100 min-h-11',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white shadow-md shadow-primary/15 hover:opacity-95 focus-visible:ring-primary dark:text-emerald-950 dark:shadow-black/25',
        cta:
          'bg-[var(--cta-solid)] text-[var(--cta-on-solid)] shadow-lg shadow-teal-950/25 hover:bg-[var(--cta-solid-hover)] focus-visible:ring-[var(--cta-solid)] focus-visible:ring-offset-[var(--landing-ink)]',
        secondary:
          'bg-neutral-100 text-primary hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-700 focus-visible:ring-primary',
        outline:
          'border border-border bg-surface text-primary hover:bg-neutral-50 dark:border-border dark:bg-surface dark:hover:bg-neutral-900 focus-visible:ring-primary',
        ghost: 'text-primary hover:bg-neutral-100 dark:text-neutral-50 dark:hover:bg-neutral-800',
        destructive: 'bg-error text-white hover:bg-error-dark focus-visible:ring-error',
        success: 'bg-success text-white hover:bg-success-700 focus-visible:ring-success',
        onDarkGhost:
          'border border-white/20 bg-white/5 text-landing-fg hover:bg-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--landing-ink)]',
      },
      size: {
        sm: 'h-11 px-4 text-xs',
        md: 'h-11 px-5 text-sm',
        lg: 'min-h-12 h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
