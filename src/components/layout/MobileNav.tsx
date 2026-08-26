import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Sun,
  CheckCircle2,
  StickyNote,
  Heart,
  Flame,
  CheckCheck,
  Trash,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import { useNoteStore } from '../../stores/noteStore'
import { useAuthStore } from '../../stores/authStore'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '../../lib/utils'

export const MobileNav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const signOut = useAuthStore((s) => s.signOut)

  const tasks = useTaskStore((s) => s.tasks)
  const notes = useNoteStore((s) => s.notes)

  const todayStr = new Date().toISOString().split('T')[0]
  const myDayCount = tasks.filter(
    (t) => !t.is_completed && (t.is_my_day_date === todayStr || t.due_date === todayStr)
  ).length
  const notesCount = notes.filter((n) => n.deleted_at === null).length
  const allTasksCount = tasks.filter((t) => !t.is_completed).length

  return (
    <>
      {/* Drawer Menu for Additional Views on Mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative glass-panel-elevated p-6 rounded-t-3xl shadow-2xl z-10 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-glass-border-subtle">
              <div className="flex items-center gap-2.5">
                <img src="./logo.svg" alt="Two-Do" className="w-8 h-8" />
                <span className="font-extrabold text-base text-ink">Two-Do Views</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-surface text-ink-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-sm font-semibold">
              <NavLink
                to="/important"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface text-ink"
              >
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Important (P1/P2)</span>
              </NavLink>
              <NavLink
                to="/completed"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface text-ink"
              >
                <CheckCheck className="w-4 h-4 text-emerald-500" />
                <span>Completed Tasks</span>
              </NavLink>
              <NavLink
                to="/bucket-list"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface text-ink"
              >
                <Heart className="w-4 h-4 text-blossom-accent" />
                <span>Bucket List</span>
              </NavLink>
              <NavLink
                to="/recycle-bin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface text-ink"
              >
                <Trash className="w-4 h-4 text-ink-subtle" />
                <span>Recycle Bin</span>
              </NavLink>
            </div>

            <div className="pt-3 border-t border-glass-border-subtle flex items-center justify-between">
              <ThemeToggle size="sm" />
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  signOut()
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Glass Navigation Bar */}
      <nav className="fixed bottom-3 left-3 right-3 md:hidden z-40 glass-panel-elevated p-2 rounded-2xl flex items-center justify-around shadow-2xl">
        <NavLink
          to="/today"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all relative',
              isActive ? 'text-amber-500 bg-surface' : 'text-ink-muted hover:text-ink'
            )
          }
        >
          <Sun className="w-5 h-5" />
          <span>My Day</span>
          {myDayCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all relative',
              isActive ? 'text-lavender-accent bg-surface' : 'text-ink-muted hover:text-ink'
            )
          }
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Tasks</span>
          {allTasksCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-lavender-accent" />
          )}
        </NavLink>

        <NavLink
          to="/notes"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all relative',
              isActive ? 'text-skyblue-accent bg-surface' : 'text-ink-muted hover:text-ink'
            )
          }
        >
          <StickyNote className="w-5 h-5" />
          <span>Notes</span>
          {notesCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-skyblue-accent" />
          )}
        </NavLink>

        <NavLink
          to="/bucket-list"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all',
              isActive ? 'text-blossom-accent bg-surface' : 'text-ink-muted hover:text-ink'
            )
          }
        >
          <Heart className="w-5 h-5" />
          <span>Bucket</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold text-ink-muted hover:text-ink transition-all"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  )
}
