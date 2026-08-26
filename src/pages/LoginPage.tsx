import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Mail,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Settings2,
  Database,
  Check,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { BackgroundMesh } from '../components/layout/BackgroundMesh'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import {
  isSupabaseConfigured,
  getSupabaseConfigStatus,
  saveCustomSupabaseConfig,
} from '../lib/supabaseClient'

export const LoginPage: React.FC = () => {
  const signIn = useAuthStore((s) => s.signIn)
  const authError = useAuthStore((s) => s.error)
  const loading = useAuthStore((s) => s.loading)

  const [email, setEmail] = useState('krrish4173@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Supabase Credentials Settings Modal
  const [showConfig, setShowConfig] = useState(false)
  const configStatus = getSupabaseConfigStatus()
  const [customUrl, setCustomUrl] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('two_do_supabase_url') || import.meta.env.VITE_SUPABASE_URL || ''
      : ''
  )
  const [customKey, setCustomKey] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('two_do_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      : ''
  )

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    saveCustomSupabaseConfig(customUrl, customKey)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email.trim()) {
      setLocalError('Please enter your email.')
      return
    }

    if (isSupabaseConfigured && !password) {
      setLocalError('Please enter the password you created in your Supabase Dashboard.')
      return
    }

    const res = await signIn(email, password)
    if (!res.success && res.error) {
      if (res.error.toLowerCase().includes('invalid login credentials')) {
        setLocalError(
          'Invalid credentials: Make sure this is the password you set in Supabase Dashboard -> Authentication -> Users.'
        )
      } else if (res.error.toLowerCase().includes('invalid path')) {
        setLocalError(
          'Supabase URL error: Ensure your Supabase Project URL is formatted as https://<project-ref>.supabase.co (without trailing slashes).'
        )
      } else {
        setLocalError(res.error)
      }
    }
  }

  const authorizedQuickUsers = [
    { email: 'krrish4173@gmail.com', name: 'Krrish', color: '#C4AEF0' },
    { email: 'Gparashar2504@gmail.com', name: 'Gparashar', color: '#A7C7E7' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundMesh />

      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="w-full max-w-md"
      >
        <GlassCard variant="elevated" className="p-7 sm:p-9 shadow-2xl border-white/60">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-lavender-600 via-blossom-400 to-skyblue-400 flex items-center justify-center text-white shadow-lg shadow-lavender-600/30 mb-4">
              <Sparkles className="w-7 h-7" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Two-Do</h1>
            <p className="text-xs sm:text-sm text-ink/60 mt-1">
              Private workspace for two. Sign-in to sync.
            </p>

            {/* Connection Status Pill */}
            <div className="mt-3 flex items-center gap-1.5">
              {configStatus.isConfigured ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Interactive Demo Mode
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="p-1 rounded-lg text-ink/40 hover:text-ink hover:bg-black/5 transition-colors"
                title="Supabase Connection Settings"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Optional Supabase Connection Settings Drawer */}
          <AnimatePresence>
            {showConfig && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <form
                  onSubmit={handleSaveConfig}
                  className="p-4 rounded-2xl bg-white/70 border border-black/5 flex flex-col gap-3 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-ink/70">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-lavender-600" />
                      Supabase Credentials
                    </span>
                  </div>

                  <GlassInput
                    type="text"
                    placeholder="https://xyzcompany.supabase.co"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="text-xs py-2"
                  />

                  <GlassInput
                    type="password"
                    placeholder="Supabase Anon Key (eyJhbGci...)"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="text-xs py-2"
                  />

                  <div className="flex justify-end gap-2 mt-1">
                    <GlassButton type="submit" size="sm" variant="primary">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Save & Connect
                    </GlassButton>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

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
              placeholder={isSupabaseConfigured ? 'Supabase Password' : 'Password (optional in demo mode)'}
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
                className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
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
