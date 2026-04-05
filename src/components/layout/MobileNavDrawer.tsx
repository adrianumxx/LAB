'use client'

import type { RefObject, ReactNode } from 'react'
import { useRef } from 'react'
import { useMobileDrawerA11y } from '@/hooks/useMobileDrawerA11y'

export type MobileNavDrawerProps = {
  open: boolean
  onClose: () => void
  drawerId: string
  /** `aria-label` on the dialog when no title is desired; prefer title + aria-labelledby */
  dialogAriaLabel: string
  /** Visible heading inside the drawer */
  title: string
  menuButtonRef: RefObject<HTMLButtonElement | null>
  children: ReactNode
}

/**
 * Mobile-only overlay + sliding panel for dashboard hamburger menus.
 * Uses design tokens for motion; global `prefers-reduced-motion` shortens durations in globals.css.
 */
export function MobileNavDrawer({
  open,
  onClose,
  drawerId,
  dialogAriaLabel,
  title,
  menuButtonRef,
  children,
}: MobileNavDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  useMobileDrawerA11y({
    open,
    onClose,
    drawerRef,
    returnFocusRef: menuButtonRef,
  })

  if (!open) {
    return null
  }

  const titleId = `${drawerId}-title`

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="mobile-nav-drawer-backdrop-in fixed inset-0 z-modal bg-black/40 md:hidden"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        id={drawerId}
        className="mobile-nav-drawer-panel-in fixed top-0 right-0 z-modal flex h-full w-[min(100%,20rem)] flex-col gap-1 border-l border-border bg-surface p-4 shadow-lg md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label={dialogAriaLabel}
        aria-labelledby={titleId}
      >
        <h2
          id={titleId}
          className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary"
        >
          {title}
        </h2>
        {children}
      </div>
    </>
  )
}
