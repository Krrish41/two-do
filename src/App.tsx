import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { TodayPage } from './pages/TodayPage'
import { TasksPage } from './pages/TasksPage'
import { NotesPage } from './pages/NotesPage'
import { RecycleBinPage } from './pages/RecycleBinPage'
import { MenuPage } from './pages/MenuPage'
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
  const location = useLocation()

  const fetchTasks = useTaskStore((s) => s.fetchTasks)
  const fetchNotes = useNoteStore((s) => s.fetchNotes)
  const folders = useNoteStore((s) => s.folders)
  const receiveRealtimeTask = useTaskStore((s) => s.receiveRealtimeTask)
  const receiveRealtimeNote = useNoteStore((s) => s.receiveRealtimeNote)
  const receiveRealtimeFolder = useNoteStore((s) => s.receiveRealtimeFolder)
  const receiveRealtimeTag = useNoteStore((s) => s.receiveRealtimeTag)
  const receiveRealtimeNoteTag = useNoteStore((s) => s.receiveRealtimeNoteTag)

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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tags' },
        (payload: any) => {
          receiveRealtimeTag({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'note_tags' },
        (payload: any) => {
          receiveRealtimeNoteTag({
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
  }, [session, receiveRealtimeTask, receiveRealtimeNote, receiveRealtimeFolder, receiveRealtimeTag, receiveRealtimeNoteTag])

  // Helper to determine the current page title for minimal mobile top app bar
  const getPageTitle = (pathname: string): string => {
    if (pathname === '/today' || pathname === '/') return 'Today'
    if (pathname === '/tasks') return 'All Tasks'
    if (pathname === '/important') return 'Important'
    if (pathname === '/completed') return 'Completed'
    if (pathname === '/bucket-list') return 'Bucket List'
    if (pathname === '/notes') return 'Notes'
    if (pathname === '/recycle-bin') return 'Recycle Bin'
    if (pathname === '/menu') return 'Menu'
    if (pathname.startsWith('/folder/')) {
      const folderId = pathname.replace('/folder/', '')
      const folder = folders.find((f) => f.id === folderId)
      return folder ? folder.name : 'Folder'
    }
    return 'Two-Do'
  }

  const pageTitle = getPageTitle(location.pathname)

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
      {/* Minimal Mobile Top App Bar (Title only, zero persistent floating icons) */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-surface/85 backdrop-blur-xl border-b border-glass-border-subtle shadow-xs select-none">
        <div className="flex items-center gap-2.5">
          <img
            src="./logo.svg"
            alt="Two-Do"
            className="w-6 h-6 drop-shadow-sm"
          />
          <h1 className="font-extrabold text-base text-ink tracking-tight">{pageTitle}</h1>
        </div>
      </header>

      {/* Desktop/Tablet Sidebar (hidden on mobile, static on desktop) */}
      <Sidebar />

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
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/login" element={<Navigate to="/today" replace />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation Bar (5 tabs: Today, Tasks, Notes, Bucket, Menu) */}
      <MobileNav />

      {/* Global Modals & Slide-Overs */}
      <TaskDetailSheet />
      <NoteEditor />
    </div>
  )
}

export default App
