import { create } from 'zustand'
import { useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: (theme: Theme) => {
    set({ theme })

    if (theme === 'system') {
      localStorage.removeItem('theme')
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
      set({ resolvedTheme: isDark ? 'dark' : 'light' })
    } else {
      localStorage.setItem('theme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
      set({ resolvedTheme: theme })
    }
  },
}))

function isStoredTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

/**
 * Init tema solo al mount. Prima: [theme, setTheme] nelle deps → effect ripetuto
 * dopo ogni setTheme (anche idempotente) → loop di aggiornamenti / UI bloccata.
 */
export function useThemeEffect() {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (isStoredTheme(saved)) {
      useThemeStore.getState().setTheme(saved)
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
      useThemeStore.setState({ resolvedTheme: isDark ? 'dark' : 'light' })
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (useThemeStore.getState().theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
}
