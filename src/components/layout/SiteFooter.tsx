import Link from 'next/link'
import { cn } from '@/lib/utils'

type SiteFooterTone = 'default' | 'inverse'

interface SiteFooterProps {
  tone?: SiteFooterTone
  className?: string
}

export function SiteFooter({ tone = 'default', className }: SiteFooterProps) {
  const isInverse = tone === 'inverse'

  return (
    <footer
      className={cn(
        'mt-auto border-t py-6',
        isInverse
          ? 'border-white/20 text-white/80'
          : 'border-border bg-surface text-secondary',
        className,
      )}
      role="contentinfo"
    >
      <div className="container flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <Link
          href="/privacy"
          className={cn(
            'underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            isInverse
              ? 'text-white focus-visible:outline-white'
              : 'text-primary focus-visible:outline-primary',
          )}
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          className={cn(
            'underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            isInverse
              ? 'text-white focus-visible:outline-white'
              : 'text-primary focus-visible:outline-primary',
          )}
        >
          Terms
        </Link>
      </div>
    </footer>
  )
}
