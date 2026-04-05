'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer'

const LINKS = [
  { href: '/manager', label: 'Home', match: 'exact' as const },
  { href: '/manager/units', label: 'Units', match: 'prefix' as const },
  { href: '/manager/cases', label: 'Cases', match: 'prefix' as const },
  { href: '/manager/maintenance', label: 'Maintenance', match: 'prefix' as const },
  { href: '/account/billing', label: 'Billing', match: 'prefix' as const },
  { href: '/account/preferences', label: 'Preferences', match: 'prefix' as const },
  { href: '/onboarding/manager', label: 'Setup wizard', match: 'prefix' as const },
] as const

function linkActive(
  pathname: string,
  href: string,
  match: 'exact' | 'prefix',
): boolean {
  if (match === 'exact') {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function ManagerMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <nav
      className="border-b border-border bg-surface/90 -mt-2 mb-6 md:mb-8"
      aria-label="Manager sections"
    >
      <div className="flex items-center justify-between min-h-[var(--s12)] gap-4">
        <ul className="hidden md:flex flex-wrap items-center gap-6 text-sm">
          {LINKS.map((item) => {
            const active = linkActive(pathname, item.href, item.match)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'text-secondary transition-colors duration-base ease-[var(--ease-out)] hover:text-primary',
                    active && 'text-primary font-semibold',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <button
          ref={menuButtonRef}
          type="button"
          className="md:hidden inline-flex min-h-[var(--s10)] min-w-[var(--s10)] items-center justify-center rounded-lg border border-border p-2 text-primary transition-colors duration-fast ease-[var(--ease-out)] hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-expanded={open}
          aria-controls="manager-mobile-drawer"
          aria-haspopup="dialog"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      <MobileNavDrawer
        open={open}
        onClose={() => setOpen(false)}
        drawerId="manager-mobile-drawer"
        dialogAriaLabel="Manager navigation"
        title="Navigation"
        menuButtonRef={menuButtonRef}
      >
        {LINKS.map((item) => {
          const active = linkActive(pathname, item.href, item.match)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-3 text-sm text-primary transition-colors duration-fast ease-[var(--ease-out)] hover:bg-neutral-100 dark:hover:bg-neutral-800',
                active && 'bg-neutral-100 font-semibold dark:bg-neutral-800',
              )}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          )
        })}
      </MobileNavDrawer>
    </nav>
  )
}
