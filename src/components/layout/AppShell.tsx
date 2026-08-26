import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { BackgroundMesh } from './BackgroundMesh'
import { ThemeToggle } from './ThemeToggle'
import { TaskDetailSheet } from '../tasks/TaskDetailSheet'
import { NoteEditor } from '../notes/NoteEditor'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'
import { useTaskStore } from '../../stores/taskStore'
import { useNoteStore } from '../../stores/noteStore'

export const AppShell: React.FC = () => {
  // Initialize Realtime Postgres Change listeners
  useRealtimeSync()

  const fetchTasks = useTaskStore((s) => s.fetchTasks)
  const fetchNotes = useNoteStore((s) => s.fetchNotes)

  useEffect(() => {
    fetchTasks()
    fetchNotes()
  }, [fetchTasks, fetchNotes])

  return (
    <div className="relative min-h-screen flex text-ink pb-20 md:pb-0">
      <BackgroundMesh />
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 w-full overflow-y-auto">
        <Outlet />
      </main>

      {/* Floating Theme Toggle */}
      <div className="fixed top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      <MobileNav />

      {/* Global Modals & Detail Sheets */}
      <TaskDetailSheet />
      <NoteEditor />
    </div>
  )
}
