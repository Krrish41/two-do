import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { BackgroundMesh } from './BackgroundMesh'
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

  React.useEffect(() => {
    fetchTasks()
    fetchNotes()
  }, [fetchTasks, fetchNotes])

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row text-ink pb-24 md:pb-0">
      <BackgroundMesh />

      {/* Desktop/Tablet Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto p-3.5 sm:p-6 lg:p-8 w-full overflow-y-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals & Detail Sheets */}
      <TaskDetailSheet />
      <NoteEditor />
    </div>
  )
}
