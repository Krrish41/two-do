import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun,
  Plus,
  Sparkles,
  Calendar,
  Flag,
  UserCheck,
  ChevronDown,
  ChevronUp,
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
  const toggleMyDay = useTaskStore((s) => s.toggleMyDay)

  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)
  const allUsers = useAuthStore((s) => s.allUsers)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<number>(0)
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(authorizedUser?.id || null)
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'mine' | 'partner'>('all')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  // Filter tasks for My Day
  const todayTasks = tasks.filter(
    (t) =>
      !t.parent_task_id &&
      (t.is_my_day_date === todayStr || t.due_date === todayStr)
  )

  const filteredTasks = todayTasks.filter((t) => {
    if (assigneeFilter === 'mine') return t.assigned_to === authorizedUser?.id
    if (assigneeFilter === 'partner') return t.assigned_to === partnerUser?.id
    return true
  })

  // Suggestions: tasks that are not yet in My Day and not completed
  const suggestedTasks = tasks.filter(
    (t) =>
      !t.parent_task_id &&
      !t.is_completed &&
      t.is_my_day_date !== todayStr &&
      t.due_date !== todayStr
  )

  const completedCount = todayTasks.filter((t) => t.is_completed).length
  const totalCount = todayTasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleQuickAdd = async (e: React.FormEvent) => {
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

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sun className="w-4 h-4" />
            <span>My Day</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {todayFormatted}
          </h1>
          <p className="text-xs sm:text-sm text-ink/60 mt-0.5">
            Focus on what matters most for you and your partner today.
          </p>
        </div>

        {/* Daily Progress Widget */}
        {totalCount > 0 && (
          <GlassCard variant="subtle" className="p-3.5 flex items-center gap-4 min-w-[200px]">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-ink mb-1.5">
                <span>Completed</span>
                <span>{completedCount} / {totalCount} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="h-full bg-gradient-to-r from-amber-400 to-lavender-600 rounded-full"
                />
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0" />
          </GlassCard>
        )}
      </div>

      {/* Quick Add Task Input Card */}
      <GlassCard variant="default" className="p-3 sm:p-4 shadow-glass">
        <form onSubmit={handleQuickAdd} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Add a task to My Day..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base font-medium text-ink placeholder:text-ink/40 outline-none"
            />
            <GlassButton type="submit" size="sm" variant="primary" disabled={!newTaskTitle.trim()}>
              Add
            </GlassButton>
          </div>

          {/* Quick Options: Priority & Assignee Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5 text-xs">
            <div className="flex items-center gap-2">
              {/* Priority Chips */}
              <div className="flex items-center gap-1 bg-white/50 p-1 rounded-xl border border-black/5">
                <Flag className="w-3 h-3 text-ink/40 ml-1" />
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
                        ? 'bg-lavender-600 text-white shadow-xs'
                        : 'text-ink/60 hover:text-ink'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Assignee Chips */}
              <div className="flex items-center gap-1 bg-white/50 p-1 rounded-xl border border-black/5">
                <UserCheck className="w-3 h-3 text-ink/40 ml-1" />
                {allUsers.map((u) => {
                  const isSel = (selectedAssignee || authorizedUser?.id) === u.id
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedAssignee(u.id)}
                      className={cn(
                        'px-2 py-0.5 rounded-lg font-semibold transition-all text-[11px] flex items-center gap-1',
                        isSel ? 'bg-white text-ink shadow-xs' : 'text-ink/60 hover:text-ink'
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

            <div className="text-[11px] text-ink/50 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span>Defaults to Today</span>
            </div>
          </div>
        </form>
      </GlassCard>

      {/* Filter Tabs: All, Mine, Partner */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel-subtle">
          {[
            { id: 'all', label: 'All Today' },
            { id: 'mine', label: 'My Tasks' },
            { id: 'partner', label: `${partnerUser?.display_name || 'Partner'}'s Tasks` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAssigneeFilter(tab.id as any)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                assigneeFilter === tab.id
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/60 hover:text-ink'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {suggestedTasks.length > 0 && (
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-1.5 text-xs font-semibold text-lavender-600 hover:text-lavender-700 bg-lavender-50 px-3 py-1.5 rounded-xl border border-lavender-200 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Suggestions ({suggestedTasks.length})</span>
            {showSuggestions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Suggestions Drawer */}
      <AnimatePresence>
        {showSuggestions && suggestedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <GlassCard variant="subtle" className="p-4 flex flex-col gap-2 border-lavender-200">
              <div className="text-xs font-bold text-ink/70 uppercase tracking-wider">
                Add existing tasks to My Day
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {suggestedTasks.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-black/5 text-xs"
                  >
                    <span className="font-medium text-ink truncate pr-2">{t.title}</span>
                    <button
                      onClick={() => toggleMyDay(t.id)}
                      className="p-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 flex-shrink-0"
                      title="Add to My Day"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <TaskList
        tasks={filteredTasks}
        emptyMessage="Nothing on your plate for today!"
        emptySubtext="Add tasks above to organize your day, or relax and enjoy."
      />
    </div>
  )
}
