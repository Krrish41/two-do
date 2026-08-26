import { useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { useTaskStore } from '../stores/taskStore'
import { useNoteStore } from '../stores/noteStore'
import { useAuthStore } from '../stores/authStore'
import type { Task, Note, Folder } from '../lib/database.types'

export function useRealtimeSync() {
  const receiveRealtimeTask = useTaskStore((s) => s.receiveRealtimeTask)
  const receiveRealtimeNote = useNoteStore((s) => s.receiveRealtimeNote)
  const receiveRealtimeFolder = useNoteStore((s) => s.receiveRealtimeFolder)
  const fetchNotes = useNoteStore((s) => s.fetchNotes)
  const fetchAuthorizedUsers = useAuthStore((s) => s.fetchAuthorizedUsers)
  const session = useAuthStore((s) => s.session)

  useEffect(() => {
    if (!isSupabaseConfigured || !session) return

    const channel = supabase
      .channel('two-do-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          receiveRealtimeTask({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Task | null,
            old: payload.old as { id: string } | null,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          receiveRealtimeNote({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Note | null,
            old: payload.old as { id: string } | null,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'folders' },
        (payload) => {
          receiveRealtimeFolder({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as Folder | null,
            old: payload.old as { id: string } | null,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tags' },
        () => {
          fetchNotes()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'note_tags' },
        () => {
          fetchNotes()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'authorized_users' },
        () => {
          fetchAuthorizedUsers()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Two-Do] Realtime channel connected.')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    session,
    receiveRealtimeTask,
    receiveRealtimeNote,
    receiveRealtimeFolder,
    fetchNotes,
    fetchAuthorizedUsers,
  ])
}
