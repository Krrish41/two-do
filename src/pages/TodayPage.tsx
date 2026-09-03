import React, { useState, useMemo } from 'react'
import {
  SunIcon,
  PlusIcon,
  SparklesIcon,
  CheckCheckIcon,
} from '../components/icons'
import { TaskList } from '../components/tasks/TaskList'
import { CreatorFilterTabs } from '../components/common/CreatorFilterTabs'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

export const TodayPage: React.FC = () => {
  const tasks = useTaskStore((s) => s.tasks)
  const addTask = useTaskStore((s) => s.addTask)
  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<number>(0)
  const [creatorFilter, setCreatorFilter] = useState<'all' | 'mine' | 'partner'>('all')

  const todayStr = new Date().toISOString().split('T')[0]

  // Filter tasks that belong to "Today" (excluding deleted)
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.deleted_at !== null) return false
      if (t.parent_task_id) return false
      const isToday = t.is_my_day_date === todayStr || t.due_date === todayStr
      if (!isToday) return false

      if (creatorFilter === 'mine' && t.created_by !== authorizedUser?.id) return false
      if (creatorFilter === 'partner' && t.created_by !== partnerUser?.id) return false

      return true
    })
  }, [tasks, todayStr, creatorFilter, authorizedUser, partnerUser])

  const pendingTasks = useMemo(() => todayTasks.filter((t) => !t.is_completed), [todayTasks])
  const completedTasks = useMemo(() => todayTasks.filter((t) => t.is_completed), [todayTasks])

  // Suggested backlog tasks for today
  const suggestedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.deleted_at === null && !t.is_completed && !t.parent_task_id && !t.is_my_day_date && t.due_date !== todayStr)
      .slice(0, 3)
  }, [tasks, todayStr])

  const completionPercent =
    todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    await addTask({
      title: newTaskTitle.trim(),
      is_my_day_date: todayStr,
      due_date: todayStr,
      priority: selectedPriority,
    })

    setNewTaskTitle('')
    setSelectedPriority(0)
  }

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="flex flex-col gap-3.5 sm:gap-5 max-w-4xl mx-auto pb-32 sm:pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="hidden sm:flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
            <SunIcon size={16} />
            <span>Daily Focus</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Today
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">{currentDateFormatted}</p>
        </div>

        {/* Daily Progress Gauge */}
        {todayTasks.length > 0 && (
          <div className="flex items-center gap-3 glass-panel-subtle p-2.5 sm:p-3 rounded-2xl border border-glass-border self-start sm:self-auto">
            <div className="flex flex-col text-right">
              <div className="flex items-center justify-between text-xs font-bold text-ink mb-1">
                <span>Daily Completion</span>
                <span className="text-lavender-accent ml-2">{completionPercent}%</span>
              </div>
              <div className="w-32 sm:w-36 h-2 rounded-full bg-surface overflow-hidden border border-glass-border-subtle">
                <div
                  className="h-full bg-gradient-to-r from-lavender-accent to-skyblue-accent transition-all duration-500 rounded-full"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-lavender-accent/15 flex items-center justify-center text-lavender-accent flex-shrink-0">
              <SparklesIcon size={16} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Form */}
      <div className="relative z-30 p-3 sm:p-4 rounded-2xl bg-white/[0.7] dark:bg-[#181226]/75 backdrop-blur-xl border border-white/80 dark:border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-amber-500/60 flex items-center justify-center flex-shrink-0 text-amber-500">
              <PlusIcon size={13} className="stroke-[2.5]" />
            </div>
            <input
              type="text"
              placeholder="What do you want to accomplish today?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-ink placeholder:text-ink-muted/50 outline-none"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className={cn(
                'px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 select-none flex-shrink-0 cursor-pointer shadow-xs',
                newTaskTitle.trim()
                  ? 'bg-amber-500 text-white hover:opacity-95 active:scale-95 shadow-amber-500/25'
                  : 'bg-surface text-ink-muted/40 border border-glass-border cursor-not-allowed opacity-50'
              )}
            >
              Add
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-glass-border-subtle text-xs select-none">
            {/* Priority Micro-Segmented Control */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface/80 border border-glass-border flex-shrink-0">
              {[
                { val: 0, label: 'P0' },
                { val: 1, label: 'P1' },
                { val: 2, label: 'P2' },
                { val: 3, label: 'P3' },
              ].map((p) => {
                const isSelected = selectedPriority === p.val
                return (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setSelectedPriority(p.val)}
                    className={cn(
                      'h-6 px-2 rounded-md font-bold text-[11px] transition-all cursor-pointer',
                      isSelected
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    )}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>

            <div className="text-[11px] font-semibold text-ink-muted flex items-center gap-1.5">
              <SunIcon size={12} className="text-amber-500" />
              <span className="hidden xs:inline">Scheduled for today</span>
            </div>
          </div>
        </form>
      </div>

      {/* Filter Tabs with Nicknames & Mascot Avatars */}
      <CreatorFilterTabs
        value={creatorFilter}
        onChange={setCreatorFilter}
        allLabel="All Tasks"
        layoutId="today-creator-bubble"
        className="w-fit"
      />

      {/* Pending Tasks Section */}
      <TaskList
        tasks={pendingTasks}
        emptyMessage="You have a clear day ahead!"
        emptySubtext="Add tasks above to organize your day, or pick suggestions below."
      />

      {/* Suggested from Backlog */}
      {suggestedTasks.length > 0 && pendingTasks.length < 4 && (
        <div className="mt-2 p-4 rounded-3xl glass-panel-subtle flex flex-col gap-3 border border-glass-border">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
              <SparklesIcon size={14} className="text-lavender-accent" />
              <span>Suggestions from Backlog</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {suggestedTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-surface border border-glass-border text-xs"
              >
                <span className="font-semibold text-ink truncate pr-2">{t.title}</span>
                <button
                  type="button"
                  onClick={() =>
                    useTaskStore.getState().updateTask(t.id, {
                      is_my_day_date: todayStr,
                    })
                  }
                  className="px-2 py-0.5 rounded-lg bg-lavender-accent/15 hover:bg-lavender-accent text-lavender-accent hover:text-white font-bold transition-colors flex-shrink-0"
                >
                  + Today
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-glass-border-subtle flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
            <CheckCheckIcon size={16} />
            <span>Completed Today ({completedTasks.length})</span>
          </div>
          <TaskList tasks={completedTasks} />
        </div>
      )}
    </div>
  )
}
