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
  SunIcon,
  RepeatIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  FlagIcon,
  CloseIcon,
  FolderIcon,
  GripIcon,
  CalendarIcon,
} from '../icons'
import { GlassButton } from '../glass/GlassButton'
import { GlassInput } from '../glass/GlassInput'
import { GlassModal } from '../glass/GlassModal'
import { GlassDropdown } from '../glass/GlassDropdown'
import { GlassDatePicker } from '../glass/GlassDatePicker'
import { GlassConfirmDialog } from '../glass/GlassConfirmDialog'
import { CoupleAvatar } from '../common/CoupleAvatar'
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
        'group flex items-center gap-2 p-2 rounded-xl bg-surface hover:bg-surface-elevated transition-all text-xs border border-glass-border',
        isDragging && 'shadow-lg ring-1 ring-lavender-accent'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-0.5 text-ink-subtle hover:text-ink cursor-grab active:cursor-grabbing"
      >
        <GripIcon size={14} />
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
        {subtask.is_completed && <CheckIcon size={10} className="stroke-[3]" />}
      </button>

      <input
        type="text"
        value={subtask.title}
        onChange={(e) => onUpdate(subtask.id, e.target.value)}
        className={cn(
          'flex-1 bg-transparent text-ink outline-none font-semibold',
          subtask.is_completed && 'line-through text-ink-muted'
        )}
      />

      <button
        type="button"
        onClick={() => onDelete(subtask.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-rose-500 transition-opacity"
      >
        <TrashIcon size={14} />
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
  const softDeleteTask = useTaskStore((s) => s.softDeleteTask)
  const addTask = useTaskStore((s) => s.addTask)
  const reorderSubtasks = useTaskStore((s) => s.reorderSubtasks)

  const folders = useNoteStore((s) => s.folders)
  const createFolder = useNoteStore((s) => s.createFolder)
  const allUsers = useAuthStore((s) => s.allUsers)

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderIcon, setNewFolderIcon] = useState('📁')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const currentTask = tasks.find((t) => t.id === selectedTaskId && t.deleted_at === null)
  if (!currentTask) return null

  const creatorUser = allUsers.find((u) => u.id === currentTask.created_by)

  const subtasks = tasks
    .filter((t) => t.parent_task_id === currentTask.id && t.deleted_at === null)
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

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim() || !currentTask) return
    const newFolder = await createFolder(newFolderName.trim(), newFolderIcon)
    if (newFolder?.id) {
      updateTask(currentTask.id, { folder_id: newFolder.id })
    }
    setNewFolderName('')
    setNewFolderIcon('📁')
    setIsFolderModalOpen(false)
  }

  const isTodayTask = Boolean(currentTask.is_my_day_date)

  // Filter out system folders (Bucket List) so it is not repeated in dropdowns (Section 6)
  const assignableFolders = folders.filter((f) => !f.is_system && f.slug !== 'bucket-list')

  const folderOptions = [
    { value: '', label: 'No Folder', icon: <FolderIcon size={14} className="text-ink-muted" /> },
    ...assignableFolders.map((f) => ({
      value: f.id,
      label: f.name,
      icon: <span>{f.icon || '📁'}</span>,
    })),
  ]

  const recurrenceOptions = [
    { value: '', label: 'Never' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
  ]

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
                    <CloseIcon size={18} />
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
                    {currentTask.is_completed && <CheckIcon size={14} className="stroke-[3]" />}
                  </button>

                  <input
                    type="text"
                    value={currentTask.title}
                    onChange={(e) => updateTask(currentTask.id, { title: e.target.value })}
                    className={cn(
                      'w-full bg-transparent font-bold text-base sm:text-lg text-ink focus:outline-none placeholder:text-ink-muted',
                      currentTask.is_completed && 'line-through text-ink-muted'
                    )}
                    placeholder="Task title..."
                  />
                </div>

                {/* Quick Action: Today Focus & Custom Glass Date Picker */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleMyDay(currentTask.id)}
                    className={cn(
                      'flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition-all shadow-xs text-left',
                      isTodayTask
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300'
                        : 'glass-panel-subtle hover:bg-surface text-ink'
                    )}
                  >
                    <SunIcon size={18} className={cn(isTodayTask ? 'text-amber-500' : 'text-ink-muted')} />
                    <div>
                      <div className="font-bold">{isTodayTask ? 'In Today' : 'Add to Today'}</div>
                      <div className="text-[10px] text-ink-muted font-normal">Today's focus</div>
                    </div>
                  </button>

                  <div className="p-3 rounded-2xl border glass-panel-subtle flex flex-col justify-center gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-ink-muted font-bold">
                      <CalendarIcon size={14} />
                      <span>Due Date</span>
                    </div>
                    <GlassDatePicker
                      value={currentTask.due_date}
                      onChange={(d) => updateTask(currentTask.id, { due_date: d })}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Folder Picker & Recurrence with Custom GlassDropdown */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Folder / Project Custom Dropdown */}
                  <div className="p-3 rounded-2xl glass-panel-subtle flex flex-col gap-1.5 text-xs">
                    <label className="font-bold text-ink-muted flex items-center gap-1">
                      <FolderIcon size={14} className="text-lavender-accent" />
                      Folder / Project
                    </label>
                    <GlassDropdown
                      className="w-full"
                      options={folderOptions}
                      value={currentTask.folder_id || ''}
                      onChange={(val) => updateTask(currentTask.id, { folder_id: val || null })}
                      placeholder="No Folder"
                      actionItem={{
                        label: 'Create New Folder...',
                        icon: <PlusIcon size={14} className="text-lavender-accent" />,
                        onClick: () => setIsFolderModalOpen(true),
                      }}
                    />
                  </div>

                  {/* Recurrence Custom Dropdown */}
                  <div className="p-3 rounded-2xl glass-panel-subtle flex flex-col gap-1.5 text-xs">
                    <label className="font-bold text-ink-muted flex items-center gap-1">
                      <RepeatIcon size={14} className="text-lavender-accent" />
                      Repeat
                    </label>
                    <GlassDropdown
                      options={recurrenceOptions}
                      value={currentTask.recurrence_rule || ''}
                      onChange={(val) => updateTask(currentTask.id, { recurrence_rule: val || null })}
                      placeholder="Never"
                    />
                  </div>
                </div>

                {/* Priority Selector with High Contrast Glass Buttons */}
                <div className="p-3.5 rounded-2xl glass-panel-subtle flex flex-col gap-2">
                  <label className="text-xs font-bold text-ink-muted flex items-center gap-1.5">
                    <FlagIcon size={14} className="text-lavender-accent" />
                    Priority Level
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { val: 0, label: 'P0 - None' },
                      { val: 1, label: 'P1 - Low' },
                      { val: 2, label: 'P2 - Med' },
                      { val: 3, label: 'P3 - Urg' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => updateTask(currentTask.id, { priority: p.val })}
                        className={cn(
                          'py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border',
                          currentTask.priority === p.val
                            ? 'bg-lavender-accent text-white shadow-xs border-lavender-accent'
                            : 'bg-surface text-ink border-glass-border hover:bg-surface-elevated'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Read-Only Creator Mascot Attribution */}
                {creatorUser && (
                  <div className="p-3 rounded-2xl glass-panel-subtle flex items-center justify-between text-xs">
                    <span className="text-ink-muted font-bold">Created By</span>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface border border-glass-border font-bold text-ink">
                      <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={20} />
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
                      className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-ink outline-none placeholder:text-ink-muted font-medium"
                    />
                    <GlassButton type="submit" size="sm" variant="secondary">
                      <PlusIcon size={14} />
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
                    className="w-full glass-input rounded-xl p-3 text-xs sm:text-sm text-ink outline-none placeholder:text-ink-muted resize-none font-normal leading-relaxed"
                  />
                </div>
              </div>

              {/* Footer Soft Delete Button */}
              <div className="pt-4 border-t border-glass-border-subtle flex justify-end">
                <GlassButton
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <TrashIcon size={14} className="mr-1.5" />
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
        description="Are you sure you want to move this task and all its subtasks to the Recycle Bin?"
        confirmText="Move to Bin"
        variant="danger"
        onConfirm={() => {
          setIsDeleteDialogOpen(false)
          softDeleteTask(currentTask.id)
        }}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />

      <GlassConfirmDialog
        isOpen={Boolean(subtaskToDelete)}
        title="Delete Subtask?"
        description="Are you sure you want to move this subtask to the Recycle Bin?"
        confirmText="Delete"
        variant="danger"
        onConfirm={() => {
          if (subtaskToDelete) {
            softDeleteTask(subtaskToDelete)
            setSubtaskToDelete(null)
          }
        }}
        onCancel={() => setSubtaskToDelete(null)}
      />

      {/* New Folder Modal */}
      <GlassModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="Create New Folder"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-2 rounded-xl bg-surface border border-glass-border">
              {['📁', '💼', '🏡', '✈️', '🎨', '💡', '📚', '🎯'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewFolderIcon(emoji)}
                  className={cn(
                    'p-1.5 rounded-lg text-lg transition-transform',
                    newFolderIcon === emoji ? 'bg-lavender-accent/20 scale-110' : 'hover:bg-surface'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <GlassInput
            placeholder="Folder name (e.g. Vacation, Finance)..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFolderModalOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newFolderName.trim()}
            >
              Create Folder
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </>
  )
}
