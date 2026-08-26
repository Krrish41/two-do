import React from 'react'
import { NavLink } from 'react-router-dom'
import { Sun, CheckCircle2, StickyNote } from 'lucide-react'
import { useTaskStore } from '../../stores/taskStore'
import { useNoteStore } from '../../stores/noteStore'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '../../lib/utils'

export const MobileNav: React.FC = () => {
  const tasks = useTaskStore((s) => s.tasks)
  const notes = useNoteStore((s) => s.notes)

  const todayStr = new Date().toISOString().split('T')[0]
  const myDayCount = tasks.filter(
    (t) => !t.is_completed && (t.is_my_day_date === todayStr || t.due_date === todayStr)
  ).length
  const pendingTasksCount = tasks.filter((t) => !t.is_completed).length

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 glass-panel-elevated p-2 rounded-2xl flex items-center justify-around shadow-2xl">
      <NavLink
        to="/today"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all',
            isActive ? 'bg-white dark:bg-white/15 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-ink/60 dark:text-lavender-200/60'
          )
        }
      >
        <div className="relative">
          <Sun className="w-5 h-5" />
          {myDayCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </div>
        <span>Today</span>
      </NavLink>

      <NavLink
        to="/tasks"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all',
            isActive ? 'bg-white dark:bg-white/15 text-lavender-600 dark:text-lavender-400 shadow-sm' : 'text-ink/60 dark:text-lavender-200/60'
          )
        }
      >
        <div className="relative">
          <CheckCircle2 className="w-5 h-5" />
          {pendingTasksCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lavender-600" />
          )}
        </div>
        <span>Tasks</span>
      </NavLink>

      <NavLink
        to="/notes"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all',
            isActive ? 'bg-white dark:bg-white/15 text-skyblue-600 dark:text-skyblue-400 shadow-sm' : 'text-ink/60 dark:text-lavender-200/60'
          )
        }
      >
        <div className="relative">
          <StickyNote className="w-5 h-5" />
          {notes.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-skyblue-600" />
          )}
        </div>
        <span>Notes</span>
      </NavLink>

      <ThemeToggle size="sm" />
    </nav>
  )
}
