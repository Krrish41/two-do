import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return ''
  let cleaned = rawUrl.trim()
  // Remove trailing slashes
  cleaned = cleaned.replace(/\/+$/, '')
  // Strip /rest/v1 or /auth/v1 subpaths if user pasted the REST endpoint instead of Project URL
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '')
  // If user pasted dashboard URL, extract project ref
  if (cleaned.includes('supabase.com/dashboard/project/')) {
    const match = cleaned.match(/project\/([a-z0-9]+)/)
    if (match && match[1]) {
      cleaned = `https://${match[1]}.supabase.co`
    }
  }
  return cleaned
}

function getStoredConfig(): { url: string; anonKey: string } {
  const envUrl = sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || '')
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem('two_do_supabase_url') || '' : '').trim()
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem('two_do_supabase_anon_key') || '' : '').trim()

  const url = sanitizeSupabaseUrl(localUrl || envUrl)
  const anonKey = localKey || envKey

  return { url, anonKey }
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
