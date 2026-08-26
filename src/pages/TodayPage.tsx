import React, { useState, useMemo } from 'react'
import {
  Sun,
  Plus,
  Sparkles,
  Calendar,
  Flag,
  UserCheck,
  CheckCircle2,
} from 'lucide-react'
import { TaskList } from '../components/tasks/TaskList'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassButton } from '../components/glass/GlassButton'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

export const TodayPage: React.FC = () => {
  const tasks = useTaskStore((s) => s.tasks)
  const addTask = useTaskStore((s) => s.addTask)
  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)
  const allUsers = useAuthStore((s) => s.allUsers)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<number>(0)
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(authorizedUser?.id || null)
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'mine' | 'partner'>('all')

  const todayStr = new Date().toISOString().split('T')[0]

  // Filter tasks that belong to "My Day" (either is_my_day_date is today or due_date is today)
  const myDayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.parent_task_id) return false
      const isToday = t.is_my_day_date === todayStr || t.due_date === todayStr
      if (!isToday) return false

      if (assigneeFilter === 'mine' && t.assigned_to !== authorizedUser?.id) return false
      if (assigneeFilter === 'partner' && t.assigned_to !== partnerUser?.id) return false

      return true
    })
  }, [tasks, todayStr, assigneeFilter, authorizedUser, partnerUser])

  const pendingTasks = useMemo(() => myDayTasks.filter((t) => !t.is_completed), [myDayTasks])
  const completedTasks = useMemo(() => myDayTasks.filter((t) => t.is_completed), [myDayTasks])

  // Suggested backlog tasks for today
  const suggestedTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.is_completed && !t.parent_task_id && !t.is_my_day_date && t.due_date !== todayStr)
      .slice(0, 3)
  }, [tasks, todayStr])

  const completionPercent =
    myDayTasks.length > 0 ? Math.round((completedTasks.length / myDayTasks.length) * 100) : 0

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    await addTask({
      title: newTaskTitle.trim(),
      is_my_day_date: todayStr,
      due_date: todayStr,
      priority: selectedPriority,
      assigned_to: selectedAssignee || authorizedUser?.id,
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
            <Sun className="w-4 h-4" />
            <span>Daily Focus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            My Day
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">{currentDateFormatted}</p>
        </div>

        {/* Daily Progress Gauge */}
        {myDayTasks.length > 0 && (
          <div className="flex items-center gap-3 glass-panel-subtle p-3 rounded-2xl">
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
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Form */}
      <GlassCard variant="default" className="p-4 shadow-glass">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="What do you want to accomplish today?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base font-medium text-ink placeholder:text-ink-muted outline-none"
            />
            <GlassButton type="submit" size="sm" variant="primary" disabled={!newTaskTitle.trim()}>
              Add to Today
            </GlassButton>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-glass-border-subtle text-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Priority Selector */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-glass-border-subtle">
                <Flag className="w-3 h-3 text-ink-muted ml-1" />
                {[
                  { val: 0, label: 'P0' },
                  { val: 1, label: 'P1' },
                  { val: 2, label: 'P2' },
                  { val: 3, label: 'P3' },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setSelectedPriority(p.val)}
                    className={cn(
                      'px-2 py-0.5 rounded-lg font-bold transition-all text-[11px]',
                      selectedPriority === p.val
                        ? 'bg-lavender-accent text-white shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Assignee Selector */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-glass-border-subtle">
                <UserCheck className="w-3 h-3 text-ink-muted ml-1" />
                {allUsers.map((u) => {
                  const isSel = (selectedAssignee || authorizedUser?.id) === u.id
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedAssignee(u.id)}
                      className={cn(
                        'px-2 py-0.5 rounded-lg font-semibold transition-all text-[11px] flex items-center gap-1',
                        isSel ? 'bg-surface-elevated text-ink shadow-xs font-bold' : 'text-ink-muted hover:text-ink'
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: u.accent_color }}
                      />
                      <span>{u.display_name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="text-[11px] text-ink-subtle flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Automatically set to today</span>
            </div>
          </div>
        </form>
      </GlassCard>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel-subtle w-fit">
        {[
          { id: 'all', label: 'All My Day' },
          { id: 'mine', label: 'Mine' },
          { id: 'partner', label: partnerUser?.display_name || 'Partner' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAssigneeFilter(tab.id as any)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
              assigneeFilter === tab.id
                ? 'bg-surface-elevated text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pending Tasks Section */}
      <TaskList
        tasks={pendingTasks}
        emptyMessage="You have a clear day ahead!"
        emptySubtext="Add tasks above to organize your day, or pick suggestions below."
      />

      {/* Suggested from Backlog */}
      {suggestedTasks.length > 0 && pendingTasks.length < 4 && (
        <div className="mt-2 p-4 rounded-3xl glass-panel-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lavender-accent" />
              <span>Suggestions from Backlog</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {suggestedTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-surface border border-glass-border-subtle text-xs"
              >
                <span className="font-medium text-ink truncate pr-2">{t.title}</span>
                <button
                  type="button"
                  onClick={() =>
                    useTaskStore.getState().updateTask(t.id, {
                      is_my_day_date: todayStr,
                    })
                  }
                  className="px-2 py-0.5 rounded-lg bg-lavender-accent/20 hover:bg-lavender-accent text-lavender-600 hover:text-white dark:text-lavender-300 font-bold transition-colors flex-shrink-0"
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
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed Today ({completedTasks.length})</span>
          </div>
          <TaskList tasks={completedTasks} />
        </div>
      )}
    </div>
  )
}
