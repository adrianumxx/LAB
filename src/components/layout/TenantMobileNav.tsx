'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { MobileNavDrawer } from '@/components/layout/MobileNavDrawer'

const LINKS = [
  { href: '/tenant', label: 'Home' },
  { href: '/tenant/maintenance', label: 'Maintenance' },
  { href: '/account/billing', label: 'Billing' },
  { href: '/account/preferences', label: 'Preferences' },
] as const

export function TenantMobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <nav
      className="border-b border-border bg-surface/90 -mt-2 mb-6 md:mb-8"
      aria-label="Sezioni tenant"
    >
      <div className="flex items-center justify-between min-h-[var(--s12)] gap-4">
        <ul className="hidden md:flex flex-wrap items-center gap-6 text-sm">
          {LINKS.map((item) => {
            const active =
              item.href === '/tenant'
                ? pathname === '/tenant'
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
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
          aria-controls="tenant-mobile-drawer"
          aria-haspopup="dialog"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          <span className="sr-only">{open ? 'Chiudi menu' : 'Apri menu'}</span>
        </button>
      </div>

      <MobileNavDrawer
        open={open}
        onClose={() => setOpen(false)}
        drawerId="tenant-mobile-drawer"
        dialogAriaLabel="Navigazione sezioni tenant"
        title="Navigazione"
        menuButtonRef={menuButtonRef}
      >
        {LINKS.map((item) => {
          const active =
            item.href === '/tenant'
              ? pathname === '/tenant'
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
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
