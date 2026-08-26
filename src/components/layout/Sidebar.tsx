import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Sun,
  CheckCircle2,
  StickyNote,
  LogOut,
  Users,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useTaskStore } from '../../stores/taskStore'
import { useNoteStore } from '../../stores/noteStore'
import { cn } from '../../lib/utils'

export const Sidebar: React.FC = () => {
  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)
  const signOut = useAuthStore((s) => s.signOut)
  const isDemoMode = useAuthStore((s) => s.isDemoMode)
  const setDemoUser = useAuthStore((s) => s.setDemoUser)

  const tasks = useTaskStore((s) => s.tasks)
  const notes = useNoteStore((s) => s.notes)

  // Counts
  const todayStr = new Date().toISOString().split('T')[0]
  const myDayCount = tasks.filter(
    (t) => !t.is_completed && (t.is_my_day_date === todayStr || t.due_date === todayStr)
  ).length
  const pendingTasksCount = tasks.filter((t) => !t.is_completed).length
  const notesCount = notes.length

  const navItems = [
    {
      to: '/today',
      label: 'My Day',
      icon: Sun,
      badge: myDayCount > 0 ? myDayCount : null,
      color: 'text-amber-500',
    },
    {
      to: '/tasks',
      label: 'All Tasks',
      icon: CheckCircle2,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      color: 'text-lavender-600',
    },
    {
      to: '/notes',
      label: 'Notes & Ideas',
      icon: StickyNote,
      badge: notesCount > 0 ? notesCount : null,
      color: 'text-skyblue-600',
    },
  ]

  return (
    <aside className="w-72 hidden md:flex flex-col h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 rounded-3xl glass-panel p-5 justify-between select-none shadow-glass">
      <div className="flex flex-col gap-6">
        {/* Logo & Duo Branding */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-lavender-600 to-blossom-400 flex items-center justify-center text-white shadow-md shadow-lavender-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-ink tracking-tight">Two-Do</h1>
              <p className="text-[11px] font-medium text-ink/50">Private Duo Workspace</p>
            </div>
          </div>
        </div>

        {/* Current User & Partner Duo Pill */}
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/50 border border-white/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink/60 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-lavender-600" />
              Duo Members
            </span>
            {isDemoMode && (
              <button
                onClick={() =>
                  setDemoUser(authorizedUser?.display_name === 'Krrish' ? 'Gparashar' : 'Krrish')
                }
                className="text-[10px] text-lavender-600 hover:text-lavender-700 font-semibold flex items-center gap-1 bg-lavender-50 px-2 py-0.5 rounded-full border border-lavender-200"
                title="Switch active demo user"
              >
                <ArrowLeftRight className="w-2.5 h-2.5" />
                Switch
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-1">
            {/* Current User */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0 shadow-xs"
                style={{ backgroundColor: authorizedUser?.accent_color || '#B8A9E8' }}
              >
                {authorizedUser?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink truncate">
                  {authorizedUser?.display_name || 'You'}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </div>
              </div>
            </div>

            {/* Partner */}
            {partnerUser && (
              <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/70 border border-black/5"
                title={`Partner: ${partnerUser.display_name}`}
              >
                <div
                  className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: partnerUser.accent_color || '#A7C7E7' }}
                >
                  {partnerUser.display_name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-[11px] font-medium text-ink/80 truncate max-w-[60px]">
                  {partnerUser.display_name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-white text-ink shadow-sm border border-white/80 scale-[1.02]'
                    : 'text-ink/70 hover:bg-white/40 hover:text-ink'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn('w-4 h-4 transition-transform', item.color, isActive && 'scale-110')}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-full',
                        isActive
                          ? 'bg-lavender-100 text-lavender-600'
                          : 'bg-black/5 text-ink/50'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer: Sign Out */}
      <div className="pt-4 border-t border-black/5 flex items-center justify-between">
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-ink/60 hover:text-rose-600 hover:bg-rose-50/60 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        <span className="text-[10px] text-ink/30 font-medium">v1.0 • RLS Guarded</span>
      </div>
    </aside>
  )
}
