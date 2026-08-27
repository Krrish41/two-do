import React, { useState, useMemo } from 'react'
import {
  SunIcon,
  PlusIcon,
  SparklesIcon,
  CheckCheckIcon,
} from '../components/icons'
import { TaskList } from '../components/tasks/TaskList'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassButton } from '../components/glass/GlassButton'
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-1">
            <SunIcon size={16} />
            <span>Daily Focus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Today
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">{currentDateFormatted}</p>
        </div>

        {/* Daily Progress Gauge */}
        {todayTasks.length > 0 && (
          <div className="flex items-center gap-3 glass-panel-subtle p-3 rounded-2xl border border-glass-border">
            <div className="flex flex-col text-right">
              <div className="flex items-center justify-between text-xs font-bold text-ink mb-1">
                <span>Daily Completion</span>
                <span className="text-lavender-accent ml-2">{completionPercent}%</span>
              </div>
              <div className="w-36 h-2 rounded-full bg-surface overflow-hidden border border-glass-border-subtle">
                <div
                  className="h-full bg-gradient-to-r from-lavender-accent to-skyblue-accent transition-all duration-500 rounded-full"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-lavender-accent/15 flex items-center justify-center text-lavender-accent">
              <SparklesIcon size={18} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Form */}
      <GlassCard variant="default" className="relative z-30 p-4 shadow-glass border border-glass-border">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <PlusIcon size={20} className="text-amber-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="What do you want to accomplish today?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-ink placeholder:text-ink-muted outline-none"
            />
            <GlassButton type="submit" size="sm" variant="primary" disabled={!newTaskTitle.trim()}>
              Add to Today
            </GlassButton>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-glass-border-subtle text-xs">
            <div className="flex items-center gap-2">
              {/* High Contrast Priority Selector */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-glass-border">
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
                      style={
                        isSelected
                          ? { background: 'linear-gradient(135deg, #683CB8 0%, #1B6CB5 100%)', color: '#FFFFFF' }
                          : { color: 'var(--color-ink)' }
                      }
                      className={cn(
                        'px-2.5 py-1 rounded-lg font-extrabold transition-all text-xs border',
                        isSelected
                          ? 'border-white/20 shadow-xs'
                          : 'bg-surface border-transparent hover:bg-surface-elevated text-ink'
                      )}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
              <SunIcon size={14} className="text-amber-500" />
              <span>Automatically scheduled for today</span>
            </div>
          </div>
        </form>
      </GlassCard>

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
