import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { TodayPage } from './pages/TodayPage'
import { TasksPage } from './pages/TasksPage'
import { NotesPage } from './pages/NotesPage'
import { RecycleBinPage } from './pages/RecycleBinPage'
import { Sidebar } from './components/layout/Sidebar'
import { MobileNav } from './components/layout/MobileNav'
import { TaskDetailSheet } from './components/tasks/TaskDetailSheet'
import { NoteEditor } from './components/notes/NoteEditor'
import { useAuthStore } from './stores/authStore'
import { useTaskStore } from './stores/taskStore'
import { useNoteStore } from './stores/noteStore'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'

export const App: React.FC = () => {
  const { session, loading, initializeAuth } = useAuthStore()
  const fetchTasks = useTaskStore((s) => s.fetchTasks)
  const fetchNotes = useNoteStore((s) => s.fetchNotes)
  const receiveRealtimeTask = useTaskStore((s) => s.receiveRealtimeTask)
  const receiveRealtimeNote = useNoteStore((s) => s.receiveRealtimeNote)
  const receiveRealtimeFolder = useNoteStore((s) => s.receiveRealtimeFolder)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (session || !isSupabaseConfigured) {
      fetchTasks()
      fetchNotes()
    }
  }, [session, fetchTasks, fetchNotes])

  // Realtime subscription setup
  useEffect(() => {
    if (!isSupabaseConfigured || !session) return

    const channel = supabase
      .channel('two_do_realtime_v2')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload: any) => {
          receiveRealtimeTask({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload: any) => {
          receiveRealtimeNote({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'folders' },
        (payload: any) => {
          receiveRealtimeFolder({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, receiveRealtimeTask, receiveRealtimeNote, receiveRealtimeFolder])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <img src="./logo.svg" alt="Two-Do" className="w-14 h-14 animate-pulse drop-shadow-md" />
        </div>
        <p className="text-xs font-semibold text-ink-muted">Loading private workspace...</p>
      </div>
    )
  }

  // Not logged in -> Redirect to login page
  if (!session && isSupabaseConfigured) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <div className="flex min-h-screen max-w-[1600px] mx-auto w-full relative">
      {/* Sidebar (Desktop) */}
      <Sidebar />

      {/* Main Workspace View */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 mb-20 md:mb-4 overflow-y-auto max-w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/tasks" element={<TasksPage viewType="all" />} />
          <Route path="/important" element={<TasksPage viewType="important" />} />
          <Route path="/completed" element={<TasksPage viewType="completed" />} />
          <Route path="/bucket-list" element={<TasksPage viewType="bucket-list" />} />
          <Route path="/folder/:folderId" element={<TasksPage viewType="folder" />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/recycle-bin" element={<RecycleBinPage />} />
          <Route path="/login" element={<Navigate to="/today" replace />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Global Modals & Slide-Overs */}
      <TaskDetailSheet />
      <NoteEditor />
    </div>
  )
}
export default App
