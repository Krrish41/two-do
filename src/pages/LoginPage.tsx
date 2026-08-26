import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LockIcon,
  MailIcon,
  ChevronRightIcon,
} from '../components/icons'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassInput } from '../components/glass/GlassInput'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const signIn = useAuthStore((s) => s.signIn)

  const isFormValid = email.trim().length > 0 && password.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Validation for empty fields
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email and password.')
      return
    }

    // 2. Validation for malformed email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("That doesn't look like a valid email address.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    const result = await signIn(email.trim(), password)
    if (result.error) {
      const lowerError = result.error.toLowerCase()
      if (lowerError.includes('too many') || lowerError.includes('rate limit')) {
        setErrorMessage('Too many attempts. Please wait a moment and try again.')
      } else {
        // Generic error message for all credential failures to prevent user enumeration
        setErrorMessage('Invalid email or password.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Floating Animated Dreamy Blurred Orbs for Depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -50, 40, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-lavender-accent/30 dark:bg-lavender-accent/20 blur-[90px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 60, -30, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-skyblue-accent/30 dark:bg-skyblue-accent/20 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, 40, -40, 0],
            y: [0, -40, 50, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-blossom-accent/30 dark:bg-blossom-accent/20 blur-[90px]"
        />
      </div>

      {/* Centered Glass Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard variant="elevated" className="relative p-8 sm:p-10 shadow-2xl border border-glass-border">
          {/* Single, Clean Theme Toggle at Card Top-Right */}
          <div className="absolute top-5 right-5 z-20">
            <ThemeToggle size="sm" />
          </div>

          {/* Logo & App Rebrand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-3">
              <img
                src="./logo.svg"
                alt="Two-Do"
                className="w-16 h-16 drop-shadow-md transition-transform hover:scale-105 duration-300"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Two-Do</h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xs font-semibold">
              Yours, mine, ours.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2.5 shadow-xs"
            >
              <span className="text-base flex-shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5 ml-1">
                Email
              </label>
              <GlassInput
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<MailIcon size={16} />}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5 ml-1">
                Password
              </label>
              <GlassInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<LockIcon size={16} />}
                required
                autoComplete="current-password"
              />
            </div>

            {/* High-Contrast Gradient Solid Call-To-Action Button */}
            <motion.button
              type="submit"
              whileHover={isFormValid && !loading ? { scale: 1.02, y: -1 } : {}}
              whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
              disabled={loading}
              className={cn(
                'w-full mt-3 py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base text-white tracking-wide select-none flex items-center justify-center gap-2 transition-all duration-200 border',
                isFormValid
                  ? 'bg-gradient-to-r from-lavender-accent to-skyblue-accent border-white/20 shadow-lg shadow-lavender-accent/30 hover:brightness-110'
                  : 'bg-lavender-accent/80 border-lavender-accent/40 shadow-sm opacity-85 hover:opacity-100'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Open Workspace</span>
                  <ChevronRightIcon size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Privacy Footnote */}
          <div className="mt-8 pt-4 border-t border-glass-border-subtle text-center">
            <p className="text-[11px] text-ink-subtle font-semibold">
              Restricted workspace • Row-level PostgreSQL security
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
