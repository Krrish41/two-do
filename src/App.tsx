import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { TodayPage } from './pages/TodayPage'
import { TasksPage } from './pages/TasksPage'
import { NotesPage } from './pages/NotesPage'
import { RecycleBinPage } from './pages/RecycleBinPage'
import { Sidebar } from './components/layout/Sidebar'
import { MobileNav } from './components/layout/MobileNav'
import { ThemeToggle } from './components/layout/ThemeToggle'
import { CoupleAvatar } from './components/common/CoupleAvatar'
import { MenuIcon } from './components/icons'
import { TaskDetailSheet } from './components/tasks/TaskDetailSheet'
import { NoteEditor } from './components/notes/NoteEditor'
import { useAuthStore } from './stores/authStore'
import { useTaskStore } from './stores/taskStore'
import { useNoteStore } from './stores/noteStore'
import { supabase, isSupabaseConfigured } from './lib/supabaseClient'

export const App: React.FC = () => {
  const { session, loading, initializeAuth, authorizedUser } = useAuthStore()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

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
    <div className="flex flex-col md:flex-row min-h-screen max-w-[1600px] mx-auto w-full relative">
      {/* Mobile Top App Bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 bg-surface/90 backdrop-blur-xl border-b border-glass-border shadow-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="./logo.svg"
            alt="Two-Do"
            className="w-7 h-7 drop-shadow-sm"
          />
          <span className="font-extrabold text-base text-ink tracking-tight">Two-Do</span>
        </div>

        <div className="flex items-center gap-2">
          {authorizedUser && (
            <CoupleAvatar
              userId={authorizedUser.id}
              displayName={authorizedUser.display_name}
              size={24}
              showOnlineBadge={true}
            />
          )}
          <ThemeToggle size="sm" />
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors border border-glass-border-subtle"
            title="Open Menu"
          >
            <MenuIcon size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar (Responsive drawer on mobile, floating column on desktop) */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace View */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 mb-24 md:mb-4 overflow-y-auto max-w-full">
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

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenMenu={() => setIsMobileSidebarOpen(true)} />

      {/* Global Modals & Slide-Overs */}
      <TaskDetailSheet />
      <NoteEditor />
    </div>
  )
}
export default App
