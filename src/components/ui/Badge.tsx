import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import React from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'border border-border bg-neutral-100 text-primary dark:bg-neutral-800 dark:text-neutral-50',
        primary: 'bg-primary text-white',
        success:
          'bg-success-bg text-success-dark dark:bg-success dark:text-white',
        warning:
          'bg-warning-bg text-warning-dark dark:bg-warning dark:text-white',
        error: 'bg-error-bg text-error-dark dark:bg-error dark:text-white',
        info: 'bg-info-bg text-info-dark dark:bg-info dark:text-white',
        accent: 'bg-accent text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
