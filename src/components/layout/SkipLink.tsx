import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const skipClass = cn(
  'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50',
  'focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary',
  'focus:shadow-md focus:outline-none focus:ring-2 focus:ring-primary',
)

interface SkipLinkProps {
  href: string
  children: ReactNode
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a href={href} className={skipClass}>
      {children}
    </a>
  )
}
