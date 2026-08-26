import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { useAuthStore } from '../stores/authStore'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const signIn = useAuthStore((s) => s.signIn)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    const result = await signIn(email.trim(), password)
    if (result.error) {
      // Use generic error copy to avoid user enumeration / identity leakage
      setErrorMessage(
        result.error.includes('allowlist')
          ? 'Access denied: This workspace is restricted to authorized members.'
          : 'Invalid credentials. Please verify your email and password.'
      )
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Theme Switcher Top-Right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle size="md" />
      </div>

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
        <GlassCard variant="elevated" className="p-8 sm:p-10 shadow-2xl border border-glass-border">
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
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-xs">
              Private collaborative duo workspace for tasks, notes, and dreams.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
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
                icon={<Mail className="w-4 h-4" />}
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
                icon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
              />
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-bold shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </GlassButton>
          </form>

          {/* Privacy Footnote */}
          <div className="mt-8 pt-4 border-t border-glass-border-subtle text-center">
            <p className="text-[11px] text-ink-subtle">
              Restricted workspace • Row-level PostgreSQL security
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
