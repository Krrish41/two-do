import React, { useState } from 'react'
import {
  Sun,
  Calendar,
  Repeat,
  Trash2,
  Plus,
  Check,
  Flag,
  UserCheck,
} from 'lucide-react'
import { GlassSheet } from '../glass/GlassSheet'
import { GlassButton } from '../glass/GlassButton'
import { useTaskStore } from '../../stores/taskStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

export const TaskDetailSheet: React.FC = () => {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const setSelectedTaskId = useTaskStore((s) => s.setSelectedTaskId)
  const tasks = useTaskStore((s) => s.tasks)
  const updateTask = useTaskStore((s) => s.updateTask)
  const toggleComplete = useTaskStore((s) => s.toggleComplete)
  const toggleMyDay = useTaskStore((s) => s.toggleMyDay)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const addTask = useTaskStore((s) => s.addTask)

  const allUsers = useAuthStore((s) => s.allUsers)

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  const currentTask = tasks.find((t) => t.id === selectedTaskId)
  if (!currentTask) return null

  const subtasks = tasks.filter((t) => t.parent_task_id === currentTask.id)

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    await addTask({
      title: newSubtaskTitle.trim(),
      parent_task_id: currentTask.id,
      assigned_to: currentTask.assigned_to,
    })
    setNewSubtaskTitle('')
  }

  const isTodayTask = Boolean(currentTask.is_my_day_date)

  return (
    <GlassSheet
      isOpen={Boolean(selectedTaskId)}
      onClose={() => setSelectedTaskId(null)}
      title="Task Details"
      width="md"
    >
      <div className="flex flex-col gap-5 pb-8">
        {/* Task Title & Completed Header */}
        <div className="flex items-start gap-3 p-3 rounded-2xl glass-panel-subtle">
          <button
            onClick={() => toggleComplete(currentTask.id)}
            className={cn(
              'mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 focus:outline-none',
              currentTask.is_completed
                ? 'bg-lavender-600 border-lavender-600 text-white shadow-sm shadow-lavender-600/30'
                : 'border-ink/30 bg-white/70 hover:border-lavender-600 hover:bg-white'
            )}
          >
            {currentTask.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          <input
            type="text"
            value={currentTask.title}
            onChange={(e) => updateTask(currentTask.id, { title: e.target.value })}
            className={cn(
              'w-full bg-transparent font-semibold text-base sm:text-lg text-ink focus:outline-none placeholder:text-ink/40',
              currentTask.is_completed && 'line-through text-ink/50'
            )}
            placeholder="Task title..."
          />
        </div>

        {/* Quick Action Pills: My Day & Due Date */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => toggleMyDay(currentTask.id)}
            className={cn(
              'flex items-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all duration-200 shadow-xs text-left',
              isTodayTask
                ? 'bg-amber-500/15 border-amber-400 text-amber-900'
                : 'glass-panel-subtle hover:bg-white/60 text-ink/70'
            )}
          >
            <Sun className={cn('w-4 h-4', isTodayTask ? 'text-amber-500' : 'text-ink/50')} />
            <div>
              <div className="font-semibold">{isTodayTask ? 'In My Day' : 'Add to My Day'}</div>
              <div className="text-[10px] text-ink/50">Today's focus</div>
            </div>
          </button>

          <div className="p-3 rounded-2xl border glass-panel-subtle flex flex-col justify-center text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-ink/60 mb-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-ink/40" />
              <span>Due Date</span>
            </div>
            <input
              type="date"
              value={currentTask.due_date || ''}
              onChange={(e) => updateTask(currentTask.id, { due_date: e.target.value || null })}
              className="bg-transparent text-xs font-semibold text-ink outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Assignee Selection */}
        <div className="p-4 rounded-2xl glass-panel-subtle flex flex-col gap-2">
          <label className="text-xs font-semibold text-ink/70 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-lavender-600" />
            Assignee
          </label>
          <div className="grid grid-cols-2 gap-2">
            {allUsers.map((u) => {
              const isSelected = currentTask.assigned_to === u.id
              return (
                <button
                  key={u.id}
                  onClick={() => updateTask(currentTask.id, { assigned_to: u.id })}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all',
                    isSelected
                      ? 'bg-white shadow-sm border-lavender-400 ring-2 ring-lavender-400/20'
                      : 'bg-white/40 border-black/5 hover:bg-white/70'
                  )}
                >
                  <div
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: u.accent_color || '#B8A9E8' }}
                  >
                    {u.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{u.display_name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Priority & Recurrence Controls */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Priority Picker */}
          <div className="p-3.5 rounded-2xl glass-panel-subtle flex flex-col gap-2">
            <label className="text-xs font-semibold text-ink/70 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-lavender-600" />
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { val: 0, label: '0', title: 'None' },
                { val: 1, label: '1', title: 'Low' },
                { val: 2, label: '2', title: 'Medium' },
                { val: 3, label: '3', title: 'Urgent' },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => updateTask(currentTask.id, { priority: p.val })}
                  title={p.title}
                  className={cn(
                    'py-1.5 rounded-lg text-xs font-bold transition-all',
                    currentTask.priority === p.val
                      ? 'bg-lavender-600 text-white shadow-xs'
                      : 'bg-white/50 text-ink/70 hover:bg-white'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence Selector */}
          <div className="p-3.5 rounded-2xl glass-panel-subtle flex flex-col gap-2">
            <label className="text-xs font-semibold text-ink/70 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-lavender-600" />
              Repeat
            </label>
            <select
              value={currentTask.recurrence_rule || ''}
              onChange={(e) =>
                updateTask(currentTask.id, { recurrence_rule: e.target.value || null })
              }
              className="bg-white/60 border border-white/60 rounded-xl px-2 py-1.5 text-xs font-medium text-ink outline-none"
            >
              <option value="">Never</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="p-4 rounded-2xl glass-panel-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-ink/80 uppercase tracking-wider">
              Subtasks ({subtasks.filter((s) => s.is_completed).length}/{subtasks.length})
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-white/50 hover:bg-white/80 transition-all text-xs group"
              >
                <button
                  onClick={() => toggleComplete(st.id)}
                  className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center border transition-all',
                    st.is_completed
                      ? 'bg-lavender-600 border-lavender-600 text-white'
                      : 'border-ink/30 bg-white'
                  )}
                >
                  {st.is_completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </button>
                <input
                  type="text"
                  value={st.title}
                  onChange={(e) => updateTask(st.id, { title: e.target.value })}
                  className={cn(
                    'flex-1 bg-transparent text-ink outline-none font-medium',
                    st.is_completed && 'line-through text-ink/40'
                  )}
                />
                <button
                  onClick={() => deleteTask(st.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-ink/40 hover:text-rose-500 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-ink outline-none placeholder:text-ink/40"
                />
              </div>
              <GlassButton type="submit" size="sm" variant="secondary">
                <Plus className="w-3.5 h-3.5" />
              </GlassButton>
            </form>
          </div>
        </div>

        {/* Task Notes / Description */}
        <div className="p-4 rounded-2xl glass-panel-subtle flex flex-col gap-2">
          <label className="text-xs font-bold text-ink/80 uppercase tracking-wider">
            Notes / Details
          </label>
          <textarea
            value={currentTask.notes || ''}
            onChange={(e) => updateTask(currentTask.id, { notes: e.target.value || null })}
            placeholder="Add detailed task notes or links..."
            rows={3}
            className="w-full glass-input rounded-xl p-3 text-xs sm:text-sm text-ink outline-none placeholder:text-ink/40 resize-none"
          />
        </div>

        {/* Delete Task Button */}
        <div className="flex justify-end pt-2">
          <GlassButton
            variant="danger"
            size="sm"
            onClick={() => {
              if (window.confirm('Delete this task and all its subtasks?')) {
                deleteTask(currentTask.id)
              }
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete Task
          </GlassButton>
        </div>
      </div>
    </GlassSheet>
  )
}
