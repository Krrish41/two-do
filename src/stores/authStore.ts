import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { AuthorizedUser } from '../lib/database.types'

interface AuthState {
  session: Session | null
  user: User | null
  authorizedUser: AuthorizedUser | null
  partnerUser: AuthorizedUser | null
  allUsers: AuthorizedUser[]
  loading: boolean
  error: string | null
  isDemoMode: boolean

  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  fetchAuthorizedUsers: () => Promise<void>
  setDemoUser: (user: 'Krrish' | 'Gparashar') => void
}

// Fallback demo users for preview before entering real Supabase credentials
const DEMO_USERS: AuthorizedUser[] = [
  {
    id: 'demo-user-1',
    display_name: 'Krrish',
    accent_color: '#C4AEF0',
  },
  {
    id: 'demo-user-2',
    display_name: 'Gparashar',
    accent_color: '#A7C7E7',
  },
]

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  authorizedUser: null,
  partnerUser: null,
  allUsers: [],
  loading: true,
  error: null,
  isDemoMode: false,

  initialize: async () => {
    set({ loading: true, error: null })

    if (!isSupabaseConfigured) {
      // In offline/demo mode, activate first demo user
      set({
        session: null,
        user: { id: 'demo-user-1', email: 'krrish4173@gmail.com' } as unknown as User,
        authorizedUser: DEMO_USERS[0],
        partnerUser: DEMO_USERS[1],
        allUsers: DEMO_USERS,
        loading: false,
        isDemoMode: true,
      })
      return
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      if (session?.user) {
        set({ session, user: session.user })
        await get().fetchAuthorizedUsers()
      } else {
        set({ session: null, user: null, authorizedUser: null, partnerUser: null, allUsers: [] })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initialize session'
      set({ error: message })
    } finally {
      set({ loading: false })
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })

    if (!isSupabaseConfigured) {
      const lower = email.toLowerCase().trim()
      if (lower === 'krrish4173@gmail.com' || lower.includes('krrish')) {
        set({
          user: { id: 'demo-user-1', email: 'krrish4173@gmail.com' } as unknown as User,
          authorizedUser: DEMO_USERS[0],
          partnerUser: DEMO_USERS[1],
          allUsers: DEMO_USERS,
          loading: false,
          isDemoMode: true,
        })
        return { success: true }
      } else if (lower === 'gparashar2504@gmail.com' || lower.includes('parashar')) {
        set({
          user: { id: 'demo-user-2', email: 'gparashar2504@gmail.com' } as unknown as User,
          authorizedUser: DEMO_USERS[1],
          partnerUser: DEMO_USERS[0],
          allUsers: DEMO_USERS,
          loading: false,
          isDemoMode: true,
        })
        return { success: true }
      } else {
        set({ loading: false, error: 'Unauthorized: Only registered duo accounts are allowed.' })
        return { success: false, error: 'Unauthorized: Only registered duo accounts are allowed.' }
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        set({ error: error.message, loading: false })
        return { success: false, error: error.message }
      }

      if (data.session && data.user) {
        set({ session: data.session, user: data.user })
        await get().fetchAuthorizedUsers()

        // Verify if user is in authorized_users
        const currentAuthorized = get().authorizedUser
        if (!currentAuthorized) {
          await supabase.auth.signOut()
          set({
            session: null,
            user: null,
            error: 'Access denied: Your account is not on the authorized allowlist.',
            loading: false,
          })
          return { success: false, error: 'Access denied: Account not in authorized allowlist.' }
        }

        set({ loading: false })
        return { success: true }
      }

      set({ loading: false })
      return { success: false, error: 'Unknown authentication error.' }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      set({ error: message, loading: false })
      return { success: false, error: message }
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    set({
      session: null,
      user: null,
      authorizedUser: null,
      partnerUser: null,
      error: null,
    })
  },

  fetchAuthorizedUsers: async () => {
    if (!isSupabaseConfigured) {
      set({ allUsers: DEMO_USERS })
      return
    }

    try {
      const { data, error } = await supabase.from('authorized_users').select('*')
      if (error) throw error

      if (data) {
        const currentUserId = get().user?.id
        const currentAuthorized = data.find((u) => u.id === currentUserId) || null
        const partner = data.find((u) => u.id !== currentUserId) || null

        set({
          allUsers: data,
          authorizedUser: currentAuthorized,
          partnerUser: partner,
        })
      }
    } catch (err: unknown) {
      console.error('Error fetching authorized users:', err)
    }
  },

  setDemoUser: (user: 'Krrish' | 'Gparashar') => {
    if (user === 'Krrish') {
      set({
        user: { id: 'demo-user-1', email: 'krrish4173@gmail.com' } as unknown as User,
        authorizedUser: DEMO_USERS[0],
        partnerUser: DEMO_USERS[1],
      })
    } else {
      set({
        user: { id: 'demo-user-2', email: 'gparashar2504@gmail.com' } as unknown as User,
        authorizedUser: DEMO_USERS[1],
        partnerUser: DEMO_USERS[0],
      })
    }
  },
}))
