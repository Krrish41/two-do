import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { BackgroundMesh } from '../components/layout/BackgroundMesh'
import { isSupabaseConfigured } from '../lib/supabaseClient'

export const LoginPage: React.FC = () => {
  const signIn = useAuthStore((s) => s.signIn)
  const authError = useAuthStore((s) => s.error)
  const loading = useAuthStore((s) => s.loading)

  const [email, setEmail] = useState('krrish4173@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email.trim()) {
      setLocalError('Please enter your email.')
      return
    }

    // In production with Supabase configured, password is required
    if (isSupabaseConfigured && !password) {
      setLocalError('Please enter your password.')
      return
    }

    const res = await signIn(email, password)
    if (!res.success && res.error) {
      setLocalError(res.error)
    }
  }

  const authorizedQuickUsers = [
    { email: 'krrish4173@gmail.com', name: 'Krrish', color: '#C4AEF0' },
    { email: 'Gparashar2504@gmail.com', name: 'Gparashar', color: '#A7C7E7' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundMesh />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="w-full max-w-md"
      >
        <GlassCard variant="elevated" className="p-7 sm:p-9 shadow-2xl border-white/60">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-lavender-600 via-blossom-400 to-skyblue-400 flex items-center justify-center text-white shadow-lg shadow-lavender-600/30 mb-4">
              <Sparkles className="w-7 h-7" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Two-Do</h1>
            <p className="text-xs sm:text-sm text-ink/60 mt-1">
              Private workspace for two. Sign-in to sync.
            </p>
          </div>

          {/* Quick User Selector Pills */}
          <div className="mb-6">
            <div className="text-[11px] font-bold text-ink/60 uppercase tracking-wider mb-2 text-center">
              Select Duo Profile
            </div>
            <div className="grid grid-cols-2 gap-2">
              {authorizedQuickUsers.map((u) => {
                const isSelected = email.toLowerCase() === u.email.toLowerCase()
                return (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => setEmail(u.email)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-white shadow-sm border-lavender-400 ring-2 ring-lavender-400/25'
                        : 'bg-white/40 border-black/5 hover:bg-white/70'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-ink truncate">{u.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <GlassInput
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />

            <GlassInput
              type={showPassword ? 'text' : 'password'}
              placeholder={isSupabaseConfigured ? 'Password' : 'Password (optional in demo mode)'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-ink transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {(localError || authError) && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{localError || authError}</span>
              </motion.div>
            )}

            <GlassButton type="submit" loading={loading} variant="primary" size="lg" className="w-full mt-2">
              Sign In to Workspace
            </GlassButton>
          </form>

          {/* Security Guarantee Badge */}
          <div className="mt-8 pt-5 border-t border-black/5 flex items-center justify-center gap-2 text-center text-ink/50 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secured via PostgreSQL Row Level Security (RLS)</span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
