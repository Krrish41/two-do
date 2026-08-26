import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: ThemeMode
  isDark: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

function getSystemIsDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  const isDark = theme === 'dark' || (theme === 'system' && getSystemIsDark())
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const initialTheme: ThemeMode =
  (typeof window !== 'undefined' ? (localStorage.getItem('two_do_theme') as ThemeMode) : null) ||
  'system'

// Initialize on load
if (typeof window !== 'undefined') {
  applyTheme(initialTheme)
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  isDark: initialTheme === 'dark' || (initialTheme === 'system' && getSystemIsDark()),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('two_do_theme', theme)
    }
    applyTheme(theme)
    set({
      theme,
      isDark: theme === 'dark' || (theme === 'system' && getSystemIsDark()),
    })
  },

  toggleTheme: () => {
    const current = get().theme
    const nextTheme: ThemeMode = current === 'dark' ? 'light' : 'dark'
    get().setTheme(nextTheme)
  },
}))
