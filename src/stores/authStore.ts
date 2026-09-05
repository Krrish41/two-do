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
  initializeAuth: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  fetchAuthorizedUsers: () => Promise<void>
  setDemoUser: (index: 0 | 1) => void
}

const DEMO_USERS: AuthorizedUser[] = [
  {
    id: 'demo-user-1',
    display_name: 'Dr. Bubs',
    accent_color: '#C4AEF0',
  },
  {
    id: 'demo-user-2',
    display_name: 'Miss Mickey 🎀',
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

  initializeAuth: async () => {
    set({ loading: true, error: null })

    if (!isSupabaseConfigured) {
      set({
        session: null,
        user: { id: 'demo-user-1', email: 'demo1@example.com' } as unknown as User,
        authorizedUser: DEMO_USERS[0],
        partnerUser: DEMO_USERS[1],
        allUsers: DEMO_USERS,
        loading: false,
        isDemoMode: true,
      })
      return
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()
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
      set({
        user: { id: 'demo-user-1', email: 'demo1@example.com' } as unknown as User,
        authorizedUser: DEMO_USERS[0],
        partnerUser: DEMO_USERS[1],
        allUsers: DEMO_USERS,
        loading: false,
        isDemoMode: true,
      })
      return { success: true }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        set({ loading: false, error: error.message })
        return { success: false, error: error.message }
      }

      if (data.session && data.user) {
        set({ session: data.session, user: data.user })

        // Check if user is in authorized_users table
        const { data: authUserData, error: authUserErr } = await supabase
          .from('authorized_users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (authUserErr || !authUserData) {
          await supabase.auth.signOut()
          set({
            session: null,
            user: null,
            loading: false,
            error: 'Access denied: Account not in authorized allowlist.',
          })
          return { success: false, error: 'Access denied: Account not in authorized allowlist.' }
        }

        await get().fetchAuthorizedUsers()

        // Eagerly trigger tasks and notes fetches for the newly authorized session
        import('./taskStore').then((m) => m.useTaskStore.getState().fetchTasks())
        import('./noteStore').then((m) => m.useNoteStore.getState().fetchNotes())

        return { success: true }
      }

      return { success: false, error: 'Unknown authentication response' }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      set({ loading: false, error: message })
      return { success: false, error: message }
    } finally {
      set({ loading: false })
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
      allUsers: [],
      isDemoMode: false,
    })
  },

  fetchAuthorizedUsers: async () => {
    const currentAuthId = get().user?.id

    if (!isSupabaseConfigured) {
      set({ allUsers: DEMO_USERS, authorizedUser: DEMO_USERS[0], partnerUser: DEMO_USERS[1] })
      return
    }

    try {
      const { data, error } = await supabase.from('authorized_users').select('*')
      if (error) throw error

      if (data) {
        const currentUser = data.find((u) => u.id === currentAuthId) || null
        const partner = data.find((u) => u.id !== currentAuthId) || null
        set({
          allUsers: data,
          authorizedUser: currentUser,
          partnerUser: partner,
        })
      }
    } catch (err) {
      console.error('Failed to fetch authorized users:', err)
    }
  },

  setDemoUser: (index) => {
    const active = DEMO_USERS[index]
    const other = DEMO_USERS[index === 0 ? 1 : 0]
    set({
      authorizedUser: active,
      partnerUser: other,
      user: { id: active.id, email: `${active.display_name.toLowerCase()}@example.com` } as unknown as User,
    })
  },
}))
