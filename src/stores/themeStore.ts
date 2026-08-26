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
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem('theme') as ThemeMode | null
  if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
    return saved
  }
  return 'system'
}

const initialTheme = getInitialTheme()

// Apply immediately on module load
if (typeof window !== 'undefined') {
  applyTheme(initialTheme)

  // Listen for OS system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const currentTheme = (localStorage.getItem('theme') as ThemeMode) || 'system'
    if (currentTheme === 'system') {
      applyTheme('system')
      useThemeStore.setState({ isDark: getSystemIsDark() })
    }
  })
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  isDark: initialTheme === 'dark' || (initialTheme === 'system' && getSystemIsDark()),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
    applyTheme(theme)
    set({
      theme,
      isDark: theme === 'dark' || (theme === 'system' && getSystemIsDark()),
    })
  },

  toggleTheme: () => {
    const currentIsDark = get().isDark
    const nextTheme: ThemeMode = currentIsDark ? 'light' : 'dark'
    get().setTheme(nextTheme)
  },
}))
