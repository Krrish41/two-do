import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { BackgroundMesh } from './BackgroundMesh'
import { ThemeToggle } from './ThemeToggle'
import { TaskDetailSheet } from '../tasks/TaskDetailSheet'
import { NoteEditor } from '../notes/NoteEditor'
import { CoupleAvatar } from '../common/CoupleAvatar'
import { MenuIcon } from '../icons'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'
import { useTaskStore } from '../../stores/taskStore'
import { useNoteStore } from '../../stores/noteStore'
import { useAuthStore } from '../../stores/authStore'

export const AppShell: React.FC = () => {
  // Initialize Realtime Postgres Change listeners
  useRealtimeSync()

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const fetchTasks = useTaskStore((s) => s.fetchTasks)
  const fetchNotes = useNoteStore((s) => s.fetchNotes)
  const authorizedUser = useAuthStore((s) => s.authorizedUser)

  useEffect(() => {
    fetchTasks()
    fetchNotes()
  }, [fetchTasks, fetchNotes])

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row text-ink pb-24 md:pb-0">
      <BackgroundMesh />

      {/* Mobile Top App Bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-surface/80 backdrop-blur-xl border-b border-glass-border shadow-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="./logo.svg"
            alt="Two-Do"
            className="w-8 h-8 drop-shadow-sm"
          />
          <span className="font-extrabold text-base text-ink tracking-tight">Two-Do</span>
        </div>

        <div className="flex items-center gap-2">
          {authorizedUser && (
            <CoupleAvatar
              userId={authorizedUser.id}
              displayName={authorizedUser.display_name}
              size={28}
              showOnlineBadge={true}
            />
          )}
          <ThemeToggle size="sm" />
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors border border-glass-border-subtle"
            title="Open Menu"
          >
            <MenuIcon size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar with Mobile Drawer support */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto p-3.5 sm:p-6 lg:p-8 w-full overflow-y-auto">
        <Outlet />
      </main>

      {/* Desktop Floating Theme Toggle */}
      <div className="hidden md:block fixed top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenMenu={() => setIsMobileSidebarOpen(true)} />

      {/* Global Modals & Detail Sheets */}
      <TaskDetailSheet />
      <NoteEditor />
    </div>
  )
}
