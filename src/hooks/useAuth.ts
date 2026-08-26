import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth)
  const user = useAuthStore((s) => s.user)
  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const isDemoMode = useAuthStore((s) => s.isDemoMode)

  useEffect(() => {
    initializeAuth()

    if (!isSupabaseConfigured) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        useAuthStore.setState({ session, user: session.user })
        useAuthStore.getState().fetchAuthorizedUsers()
      } else {
        useAuthStore.setState({ session: null, user: null, authorizedUser: null, partnerUser: null })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initializeAuth])

  return {
    user,
    authorizedUser,
    partnerUser,
    loading,
    error,
    isDemoMode,
    isAuthenticated: Boolean(user && (isDemoMode || authorizedUser)),
  }
}
