'use client'

import { type RefObject, useEffect } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('data-focus-guard'),
  )
}

/**
 * Body scroll lock, Escape to close (returns focus), and Tab focus trap inside the drawer panel.
 * Respects drawer content: call only when the panel is mounted and `open` is true.
 */
export function useMobileDrawerA11y(options: {
  open: boolean
  onClose: () => void
  drawerRef: RefObject<HTMLElement | null>
  returnFocusRef: RefObject<HTMLElement | null>
}): void {
  const { open, onClose, drawerRef, returnFocusRef } = options

  useEffect(() => {
    if (!open) {
      return
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    if (!drawerRef.current) {
      return
    }

    const focusFirst = () => {
      requestAnimationFrame(() => {
        const panel = drawerRef.current
        if (!panel) {
          return
        }
        const list = getFocusables(panel)
        list[0]?.focus()
      })
    }
    focusFirst()

    function onDocKeyDown(e: KeyboardEvent) {
      const panel = drawerRef.current
      if (!panel) {
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        requestAnimationFrame(() => {
          returnFocusRef.current?.focus()
        })
        return
      }

      if (e.key !== 'Tab') {
        return
      }

      const list = getFocusables(panel)
      if (list.length === 0) {
        return
      }

      const first = list[0]
      const last = list[list.length - 1]
      if (!first || !last) {
        return
      }
      const active = document.activeElement

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onDocKeyDown)
    return () => document.removeEventListener('keydown', onDocKeyDown)
  }, [open, onClose, drawerRef, returnFocusRef])
}
