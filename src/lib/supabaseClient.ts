import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

function getStoredConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem('two_do_supabase_url') || '' : '').trim()
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem('two_do_supabase_anon_key') || '' : '').trim()

  const url = sanitizeSupabaseUrl(envUrl || localUrl)
  const anonKey = envKey || localKey

  return { url, anonKey }
}

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  let cleaned = rawUrl.trim()
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '')
  // If user accidentally pasted the dashboard URL, warn / clean
  if (cleaned.includes('supabase.com/dashboard/project/')) {
    const match = cleaned.match(/project\/([a-z0-9]+)/)
    if (match && match[1]) {
      cleaned = `https://${match[1]}.supabase.co`
    }
  }
  return cleaned
}

export function saveCustomSupabaseConfig(url: string, anonKey: string) {
  const cleanedUrl = sanitizeSupabaseUrl(url)
  const cleanedKey = anonKey.trim()

  if (typeof window !== 'undefined') {
    if (cleanedUrl && cleanedKey) {
      localStorage.setItem('two_do_supabase_url', cleanedUrl)
      localStorage.setItem('two_do_supabase_anon_key', cleanedKey)
    } else {
      localStorage.removeItem('two_do_supabase_url')
      localStorage.removeItem('two_do_supabase_anon_key')
    }
  }
  // Reload to re-initialize client
  window.location.reload()
}

const { url: initialUrl, anonKey: initialKey } = getStoredConfig()

export const isSupabaseConfigured = Boolean(
  initialUrl && 
  initialKey && 
  initialUrl.startsWith('https://') &&
  !initialUrl.includes('placeholder')
)

const effectiveUrl = isSupabaseConfigured ? initialUrl : 'https://placeholder.supabase.co'
const effectiveKey = isSupabaseConfigured ? initialKey : 'placeholder-anon-key'

export const supabase: SupabaseClient<Database> = createClient<Database>(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export function getSupabaseConfigStatus(): {
  isConfigured: boolean
  url: string
  source: 'env' | 'localStorage' | 'none'
} {
  const { url } = getStoredConfig()
  const envUrl = import.meta.env.VITE_SUPABASE_URL
  if (envUrl && !envUrl.includes('placeholder')) {
    return { isConfigured: isSupabaseConfigured, url, source: 'env' }
  }
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('two_do_supabase_url') : null
  if (localUrl) {
    return { isConfigured: isSupabaseConfigured, url, source: 'localStorage' }
  }
  return { isConfigured: false, url: '', source: 'none' }
}
