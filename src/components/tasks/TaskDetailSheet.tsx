import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Sun,
  Calendar,
  Repeat,
  Trash2,
  Plus,
  Check,
  Flag,
  X,
  Folder as FolderIcon,
  GripVertical,
  User,
} from 'lucide-react'
import { GlassButton } from '../glass/GlassButton'
import { GlassConfirmDialog } from '../glass/GlassConfirmDialog'
import { useTaskStore } from '../../stores/taskStore'
import { useAuthStore } from '../../stores/authStore'
import { useNoteStore } from '../../stores/noteStore'
import type { Task } from '../../lib/database.types'
import { cn } from '../../lib/utils'

// Sortable Subtask Item
const SortableSubtaskItem: React.FC<{
  subtask: Task
  onToggle: (id: string) => void
  onUpdate: (id: string, title: string) => void
  onDelete: (id: string) => void
}> = ({ subtask, onToggle, onUpdate, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 p-2 rounded-xl bg-surface hover:bg-surface-elevated transition-all text-xs border border-glass-border-subtle',
        isDragging && 'shadow-lg ring-1 ring-lavender-accent'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-0.5 text-ink-subtle hover:text-ink cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => onToggle(subtask.id)}
        className={cn(
          'w-4 h-4 rounded-full flex items-center justify-center transition-all flex-shrink-0 checkbox-glass',
          subtask.is_completed
            ? 'bg-lavender-accent border-lavender-accent text-white'
            : 'bg-surface hover:border-lavender-accent'
        )}
      >
        {subtask.is_completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
      </button>

      <input
        type="text"
        value={subtask.title}
        onChange={(e) => onUpdate(subtask.id, e.target.value)}
        className={cn(
          'flex-1 bg-transparent text-ink outline-none font-medium',
          subtask.is_completed && 'line-through text-ink-muted'
        )}
      />

      <button
        type="button"
        onClick={() => onDelete(subtask.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-rose-500 transition-opacity"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export const TaskDetailSheet: React.FC = () => {
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const setSelectedTaskId = useTaskStore((s) => s.setSelectedTaskId)
  const tasks = useTaskStore((s) => s.tasks)
  const updateTask = useTaskStore((s) => s.updateTask)
  const toggleComplete = useTaskStore((s) => s.toggleComplete)
  const toggleMyDay = useTaskStore((s) => s.toggleMyDay)
  const deleteTask = useTaskStore((s) => s.deleteTask)
  const addTask = useTaskStore((s) => s.addTask)
  const reorderSubtasks = useTaskStore((s) => s.reorderSubtasks)

  const folders = useNoteStore((s) => s.folders)
  const allUsers = useAuthStore((s) => s.allUsers)

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const currentTask = tasks.find((t) => t.id === selectedTaskId)
  if (!currentTask) return null

  const creatorUser = allUsers.find((u) => u.id === currentTask.created_by)

  const subtasks = tasks
    .filter((t) => t.parent_task_id === currentTask.id)
    .sort((a, b) => a.position - b.position)

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    await addTask({
      title: newSubtaskTitle.trim(),
      parent_task_id: currentTask.id,
      folder_id: currentTask.folder_id,
    })
    setNewSubtaskTitle('')
  }

  const handleSubtaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderSubtasks(currentTask.id, String(active.id), String(over.id))
    }
  }

  const isTodayTask = Boolean(currentTask.is_my_day_date)

  return (
    <>
      <AnimatePresence>
        {Boolean(selectedTaskId) && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-end md:items-stretch md:justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedTaskId(null)}
            />

            {/* Responsive Sheet */}
            <motion.div
              initial={{ y: '100%', x: 0 }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: '100%', x: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className={cn(
                'relative w-full glass-panel-elevated p-6 shadow-2xl z-10 overflow-y-auto max-h-[88vh] rounded-t-3xl md:rounded-t-none md:rounded-l-3xl md:rounded-r-none md:max-h-full md:w-[480px] md:h-full flex flex-col justify-between'
              )}
            >
              <div className="flex flex-col gap-5 pb-6">
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-glass-border-subtle">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                      Task Details
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTaskId(null)}
                    className="p-1.5 rounded-xl hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Title & Checkbox */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl glass-panel-subtle">
                  <button
                    type="button"
                    onClick={() => toggleComplete(currentTask.id)}
                    className={cn(
                      'mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none checkbox-glass',
                      currentTask.is_completed
                        ? 'bg-lavender-accent border-lavender-accent text-white shadow-sm'
                        : 'bg-surface hover:border-lavender-accent'
                    )}
                  >
                    {currentTask.is_completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <input
                    type="text"
                    value={currentTask.title}
                    onChange={(e) => updateTask(currentTask.id, { title: e.target.value })}
                    className={cn(
                      'w-full bg-transparent font-semibold text-base sm:text-lg text-ink focus:outline-none placeholder:text-ink-muted',
                      currentTask.is_completed && 'line-through text-ink-muted'
                    )}
                    placeholder="Task title..."
                  />
                </div>

                {/* Quick Action Pills: My Day & Due Date */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleMyDay(currentTask.id)}
                    className={cn(
                      'flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-medium transition-all shadow-xs text-left',
                      isTodayTask
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300'
                        : 'glass-panel-subtle hover:bg-surface text-ink/80'
                    )}
                  >
                    <Sun className={cn('w-4 h-4', isTodayTask ? 'text-amber-500' : 'text-ink-muted')} />
                    <div>
                      <div className="font-bold">{isTodayTask ? 'In My Day' : 'Add to My Day'}</div>
                      <div className="text-[10px] text-ink-muted">Today's focus</div>
                    </div>
                  </button>

                  <div className="p-3 rounded-2xl border glass-panel-subtle flex flex-col justify-center text-xs">
                    <div className="flex items-center gap-1.5 text-ink-muted mb-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
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

                {/* Folder & Recurrence Assignment */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Folder / Project Selector */}
                  <div className="p-3 rounded-2xl glass-panel-subtle flex flex-col gap-1.5 text-xs">
                    <label className="font-semibold text-ink-muted flex items-center gap-1">
                      <FolderIcon className="w-3.5 h-3.5 text-lavender-accent" />
                      Folder / Project
                    </label>
                    <select
                      value={currentTask.folder_id || ''}
                      onChange={(e) => updateTask(currentTask.id, { folder_id: e.target.value || null })}
                      className="bg-transparent text-xs font-semibold text-ink outline-none cursor-pointer"
                    >
                      <option value="">No Folder</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.icon || '📁'} {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Recurrence Rule */}
                  <div className="p-3 rounded-2xl glass-panel-subtle flex flex-col gap-1.5 text-xs">
                    <label className="font-semibold text-ink-muted flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5 text-lavender-accent" />
                      Repeat
                    </label>
                    <select
                      value={currentTask.recurrence_rule || ''}
                      onChange={(e) =>
                        updateTask(currentTask.id, { recurrence_rule: e.target.value || null })
                      }
                      className="bg-transparent text-xs font-semibold text-ink outline-none cursor-pointer"
                    >
                      <option value="">Never</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Priority Selector */}
                <div className="p-3.5 rounded-2xl glass-panel-subtle flex flex-col gap-2">
                  <label className="text-xs font-semibold text-ink-muted flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-lavender-accent" />
                    Priority Level
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { val: 0, label: 'P0' },
                      { val: 1, label: 'P1' },
                      { val: 2, label: 'P2' },
                      { val: 3, label: 'P3' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => updateTask(currentTask.id, { priority: p.val })}
                        className={cn(
                          'py-1.5 rounded-xl text-xs font-bold transition-all text-center',
                          currentTask.priority === p.val
                            ? 'bg-lavender-accent text-white shadow-xs'
                            : 'bg-surface text-ink/70 hover:bg-surface-elevated'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Read-Only Creator Attribution */}
                {creatorUser && (
                  <div className="p-3 rounded-2xl glass-panel-subtle flex items-center justify-between text-xs">
                    <span className="text-ink-muted font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-lavender-accent" />
                      Created By
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface border border-glass-border-subtle font-semibold text-ink">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: creatorUser.accent_color || '#B8A9E8' }}
                      />
                      <span>{creatorUser.display_name}</span>
                    </div>
                  </div>
                )}

                {/* Subtasks Section with Drag-and-Drop */}
                <div className="p-4 rounded-2xl glass-panel-subtle flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                      Subtasks ({subtasks.filter((s) => s.is_completed).length}/{subtasks.length})
                    </label>
                  </div>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubtaskDragEnd}>
                    <SortableContext items={subtasks.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-1.5">
                        {subtasks.map((st) => (
                          <SortableSubtaskItem
                            key={st.id}
                            subtask={st}
                            onToggle={toggleComplete}
                            onUpdate={(id, title) => updateTask(id, { title })}
                            onDelete={(id) => setSubtaskToDelete(id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Add Subtask Form */}
                  <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add a subtask..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-ink outline-none placeholder:text-ink-muted"
                    />
                    <GlassButton type="submit" size="sm" variant="secondary">
                      <Plus className="w-3.5 h-3.5" />
                    </GlassButton>
                  </form>
                </div>

                {/* Task Description / Plain Notes Area */}
                <div className="p-4 rounded-2xl glass-panel-subtle flex flex-col gap-2">
                  <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                    Description & Notes
                  </label>
                  <textarea
                    value={currentTask.notes || ''}
                    onChange={(e) => updateTask(currentTask.id, { notes: e.target.value || null })}
                    placeholder="Add detailed task notes or links..."
                    rows={3}
                    className="w-full glass-input rounded-xl p-3 text-xs sm:text-sm text-ink outline-none placeholder:text-ink-muted resize-none"
                  />
                </div>
              </div>

              {/* Footer Delete Button */}
              <div className="pt-4 border-t border-glass-border-subtle flex justify-end">
                <GlassButton
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete Task
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Confirmation Dialogs */}
      <GlassConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Task?"
        description="Are you sure you want to delete this task and all its subtasks? This action cannot be undone."
        confirmText="Delete Task"
        variant="danger"
        onConfirm={() => {
          setIsDeleteDialogOpen(false)
          deleteTask(currentTask.id)
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      <GlassConfirmDialog
        isOpen={Boolean(subtaskToDelete)}
        title="Delete Subtask?"
        description="Are you sure you want to delete this subtask?"
        confirmText="Delete"
        variant="danger"
        onConfirm={() => {
          if (subtaskToDelete) {
            deleteTask(subtaskToDelete)
            setSubtaskToDelete(null)
          }
        }}
        onCancel={() => setSubtaskToDelete(null)}
      />
    </>
  )
}
