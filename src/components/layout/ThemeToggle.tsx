import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'
import { cn } from '../../lib/utils'

export interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 'md' }) => {
  const isDark = useThemeStore((s) => s.isDark)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center p-2 rounded-2xl bg-surface border border-glass-border hover:bg-surface-elevated shadow-xs transition-all select-none focus:outline-none focus:ring-2 focus:ring-lavender-accent/30',
        size === 'sm' ? 'w-8 h-8 p-1.5 rounded-xl' : 'w-10 h-10',
        className
      )}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, scale: 0, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      >
        {isDark ? (
          <Moon className={cn(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5', 'text-lavender-300')} />
        ) : (
          <Sun className={cn(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5', 'text-amber-500')} />
        )}
      </motion.div>
    </button>
  )
}
