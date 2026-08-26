import React, { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Plus,
  Search,
  Flag,
  UserCheck,
  Calendar,
  Repeat,
  CheckCheck,
} from 'lucide-react'
import { TaskList } from '../components/tasks/TaskList'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

export const TasksPage: React.FC = () => {
  const tasks = useTaskStore((s) => s.tasks)
  const addTask = useTaskStore((s) => s.addTask)

  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)
  const allUsers = useAuthStore((s) => s.allUsers)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<number>(0)
  const [selectedDueDate, setSelectedDueDate] = useState<string>('')
  const [selectedRecurrence, setSelectedRecurrence] = useState<string>('')
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(authorizedUser?.id || null)

  const [filter, setFilter] = useState<'all' | 'mine' | 'partner' | 'urgent' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)

  const rootTasks = useMemo(() => tasks.filter((t) => !t.parent_task_id), [tasks])

  const filteredTasks = useMemo(() => {
    return rootTasks.filter((task) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesNotes = task.notes?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesNotes) return false
      }

      // Tab filters
      if (filter === 'completed') {
        return task.is_completed
      }

      if (filter === 'mine') {
        return task.assigned_to === authorizedUser?.id
      }

      if (filter === 'partner') {
        return task.assigned_to === partnerUser?.id
      }

      if (filter === 'urgent') {
        return task.priority === 3
      }

      return true
    })
  }, [rootTasks, searchQuery, filter, authorizedUser, partnerUser])

  const pendingTasks = useMemo(
    () => filteredTasks.filter((t) => !t.is_completed),
    [filteredTasks]
  )
  const completedTasks = useMemo(
    () => filteredTasks.filter((t) => t.is_completed),
    [filteredTasks]
  )

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    await addTask({
      title: newTaskTitle.trim(),
      priority: selectedPriority,
      due_date: selectedDueDate || null,
      recurrence_rule: selectedRecurrence || null,
      assigned_to: selectedAssignee || authorizedUser?.id,
    })

    setNewTaskTitle('')
    setSelectedPriority(0)
    setSelectedDueDate('')
    setSelectedRecurrence('')
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-lavender-600 font-bold text-xs uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tasks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">All Tasks</h1>
          <p className="text-xs sm:text-sm text-ink/60 mt-0.5">
            Organize, prioritize, and collaborate on shared tasks.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <GlassInput
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Quick Add Task */}
      <GlassCard variant="default" className="p-4 shadow-glass">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-lavender-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base font-medium text-ink placeholder:text-ink/40 outline-none"
            />
            <GlassButton type="submit" size="sm" variant="primary" disabled={!newTaskTitle.trim()}>
              Add Task
            </GlassButton>
          </div>

          {/* Quick Options */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
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

              {/* Due Date Input */}
              <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-xl border border-black/5">
                <Calendar className="w-3 h-3 text-ink/40" />
                <input
                  type="date"
                  value={selectedDueDate}
                  onChange={(e) => setSelectedDueDate(e.target.value)}
                  className="bg-transparent text-[11px] font-semibold text-ink outline-none cursor-pointer"
                />
              </div>

              {/* Recurrence Selector */}
              <div className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-xl border border-black/5">
                <Repeat className="w-3 h-3 text-ink/40" />
                <select
                  value={selectedRecurrence}
                  onChange={(e) => setSelectedRecurrence(e.target.value)}
                  className="bg-transparent text-[11px] font-semibold text-ink outline-none cursor-pointer"
                >
                  <option value="">No Repeat</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </GlassCard>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl glass-panel-subtle w-fit">
        {[
          { id: 'all', label: 'All' },
          { id: 'mine', label: 'Mine' },
          { id: 'partner', label: partnerUser?.display_name || 'Partner' },
          { id: 'urgent', label: 'Urgent (P3)' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
              filter === tab.id
                ? 'bg-white text-ink shadow-sm'
                : 'text-ink/60 hover:text-ink'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pending Tasks List */}
      {filter !== 'completed' && (
        <div className="flex flex-col gap-3">
          <TaskList
            tasks={pendingTasks}
            emptyMessage="No pending tasks"
            emptySubtext="Add tasks using the field above or try switching filters."
          />
        </div>
      )}

      {/* Completed Tasks Accordion */}
      {completedTasks.length > 0 && filter !== 'completed' && (
        <div className="mt-4 pt-4 border-t border-black/5 flex flex-col gap-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs font-bold text-ink/50 hover:text-ink transition-colors w-fit"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Completed Tasks ({completedTasks.length})</span>
          </button>

          {showCompleted && (
            <div className="flex flex-col gap-2 opacity-75">
              {completedTasks.map((task) => (
                <TaskList key={task.id} tasks={[task]} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Standalone Completed Tab View */}
      {filter === 'completed' && (
        <TaskList
          tasks={completedTasks}
          emptyMessage="No completed tasks yet"
          emptySubtext="Finish tasks to celebrate your productivity achievements here!"
        />
      )}
    </div>
  )
}
