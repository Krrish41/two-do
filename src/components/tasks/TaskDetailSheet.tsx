import React, { useState, useRef, useEffect, useCallback } from 'react'
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
import { GlassDropdown } from '../glass/GlassDropdown'
import { GlassDatePicker } from '../glass/GlassDatePicker'
import { GlassConfirmDialog } from '../glass/GlassConfirmDialog'
import { CoupleAvatar } from '../common/CoupleAvatar'
import { FolderIconRenderer } from '../common/FolderIconRenderer'
import { CreateFolderModal } from '../common/CreateFolderModal'
import { useTaskStore } from '../../stores/taskStore'
import { useAuthStore } from '../../stores/authStore'
import { useNoteStore } from '../../stores/noteStore'
import type { Task } from '../../lib/database.types'
import { cn } from '../../lib/utils'

// Sortable Subtask Item with local debounced state
const SortableSubtaskItem: React.FC<{
  subtask: Task
  onToggle: (id: string) => void
  onUpdate: (id: string, title: string) => void
  onDelete: (id: string) => void
}> = ({ subtask, onToggle, onUpdate, onDelete }) => {
  const [localTitle, setLocalTitle] = useState(subtask.title)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocalTitle(subtask.title)
    }
  }, [subtask.title])

  const handleChange = (newTitle: string) => {
    setLocalTitle(newTitle)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onUpdate(subtask.id, newTitle)
    }, 500)
  }

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
        ref={inputRef}
        type="text"
        data-task-id={subtask.id}
        value={localTitle}
        onChange={(e) => handleChange(e.target.value)}
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
  const allUsers = useAuthStore((s) => s.allUsers)

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [subtaskToDelete, setSubtaskToDelete] = useState<string | null>(null)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)

  const currentTask = tasks.find((t) => t.id === selectedTaskId && t.deleted_at === null)

  // Local state for Title and Notes (eliminates typing lag and cursor resets)
  const [localTitle, setLocalTitle] = useState(currentTask?.title || '')
  const [localNotes, setLocalNotes] = useState(currentTask?.notes || '')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')

  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeTaskIdRef = useRef<string | null>(selectedTaskId)
  const lastLoadedTaskIdRef = useRef<string | null>(null)
  const titleInputRef = useRef<HTMLTextAreaElement | null>(null)
  const notesTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const requestSeqRef = useRef(0)

  // Keep activeTaskIdRef updated
  useEffect(() => {
    activeTaskIdRef.current = selectedTaskId
  }, [selectedTaskId])

  // Adjust title textarea height dynamically
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = 'auto'
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`
    }
  }, [localTitle, selectedTaskId])

  // Sync from server/store ONLY when switching to a different task
  useEffect(() => {
    if (selectedTaskId && currentTask) {
      if (lastLoadedTaskIdRef.current !== selectedTaskId) {
        lastLoadedTaskIdRef.current = selectedTaskId
        setLocalTitle(currentTask.title)
        setLocalNotes(currentTask.notes || '')
      }
    } else {
      lastLoadedTaskIdRef.current = null
    }
  }, [selectedTaskId, currentTask])

  // Debounced save title
  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle)
    if (titleInputRef.current) {
      titleInputRef.current.style.height = 'auto'
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`
    }
    setSaveStatus('saving')
    if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current)

    const seq = ++requestSeqRef.current
    titleTimeoutRef.current = setTimeout(async () => {
      if (activeTaskIdRef.current) {
        await updateTask(activeTaskIdRef.current, { title: newTitle })
        if (seq === requestSeqRef.current) {
          setSaveStatus('saved')
        }
      }
    }, 500)
  }

  // Debounced save notes
  const handleNotesChange = (newNotes: string) => {
    setLocalNotes(newNotes)
    setSaveStatus('saving')
    if (notesTimeoutRef.current) clearTimeout(notesTimeoutRef.current)

    const seq = ++requestSeqRef.current
    notesTimeoutRef.current = setTimeout(async () => {
      if (activeTaskIdRef.current) {
        await updateTask(activeTaskIdRef.current, { notes: newNotes.trim() ? newNotes : null })
        if (seq === requestSeqRef.current) {
          setSaveStatus('saved')
        }
      }
    }, 500)
  }

  // Flush pending saves on close
  const flushSave = useCallback(() => {
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
      titleTimeoutRef.current = null
    }
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current)
      notesTimeoutRef.current = null
    }
    if (activeTaskIdRef.current) {
      updateTask(activeTaskIdRef.current, {
        title: localTitle,
        notes: localNotes.trim() ? localNotes : null,
      })
      setSaveStatus('saved')
    }
  }, [localTitle, localNotes, updateTask])

  const handleClose = () => {
    flushSave()
    setSelectedTaskId(null)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

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

  const isTodayTask = Boolean(currentTask.is_my_day_date)

  // Filter out system folders (Bucket List) so it is not repeated in dropdowns
  const assignableFolders = folders.filter((f) => !f.is_system && f.slug !== 'bucket-list')

  const folderOptions = [
    { value: '', label: 'No Folder', icon: <FolderIcon size={14} className="text-ink-muted" /> },
    ...assignableFolders.map((f) => ({
      value: f.id,
      label: f.name,
      icon: <FolderIconRenderer icon={f.icon} size={14} className="flex-shrink-0" />,
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
              onClick={handleClose}
            />

            {/* Responsive Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className={cn(
                'relative w-full glass-panel-elevated shadow-2xl z-10 rounded-t-[32px] md:rounded-t-none md:rounded-l-[32px] md:rounded-r-none max-h-[92dvh] md:max-h-full md:w-[490px] md:h-full flex flex-col overflow-hidden'
              )}
            >
              {/* FIXED HEADER BAR */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-glass-border-subtle flex items-center justify-between bg-surface/80 dark:bg-[#1E1630]/85 backdrop-blur-xl z-20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                    Task Details
                  </span>
                  {/* Saving / Saved Indicator */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all bg-surface/60 border border-glass-border">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full transition-colors',
                        saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                      )}
                    />
                    <span className="text-ink-muted">{saveStatus === 'saving' ? 'Saving…' : 'Saved'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-xl hover:bg-surface text-ink-muted hover:text-ink transition-colors cursor-pointer"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {/* SCROLLABLE BODY (Never cuts off content on laptop or phone) */}
              <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 overscroll-contain">
                {/* Title & Checkbox */}
                <div className="flex items-start gap-3.5 p-4 rounded-2xl glass-panel-subtle">
                  <button
                    type="button"
                    onClick={() => toggleComplete(currentTask.id)}
                    className={cn(
                      'mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none checkbox-glass cursor-pointer',
                      currentTask.is_completed
                        ? 'bg-lavender-accent border-lavender-accent text-white shadow-sm'
                        : 'bg-surface hover:border-lavender-accent'
                    )}
                  >
                    {currentTask.is_completed && <CheckIcon size={14} className="stroke-[3]" />}
                  </button>

                  <textarea
                    ref={titleInputRef}
                    data-task-id={currentTask.id}
                    value={localTitle}
                    rows={1}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={cn(
                      'w-full bg-transparent font-bold text-base sm:text-lg text-ink focus:outline-none placeholder:text-ink-muted resize-none leading-snug break-words',
                      currentTask.is_completed && 'line-through text-ink-muted'
                    )}
                    placeholder="Task title..."
                  />
                </div>

                {/* Quick Action: Today Focus & Custom Glass Date Picker */}
                <div className="grid grid-cols-2 gap-3 relative z-30">
                  <button
                    type="button"
                    onClick={() => toggleMyDay(currentTask.id)}
                    className={cn(
                      'flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-semibold transition-all shadow-xs text-left cursor-pointer',
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

                  <div className="p-3.5 rounded-2xl border glass-panel-subtle flex flex-col justify-center gap-1.5 text-xs relative z-30">
                    <div className="flex items-center gap-1.5 text-ink-muted font-bold">
                      <CalendarIcon size={14} />
                      <span>Due Date</span>
                    </div>
                    <GlassDatePicker
                      value={currentTask.due_date}
                      onChange={(date) => updateTask(currentTask.id, { due_date: date })}
                      align="right"
                    />
                  </div>
                </div>

                {/* Folder & Recurrence Card */}
                <div className="p-4 rounded-2xl glass-panel-subtle grid grid-cols-2 gap-3.5 relative z-20">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink-muted flex items-center gap-1.5">
                      <FolderIcon size={14} className="text-lavender-accent" />
                      Folder
                    </label>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 min-w-0">
                        <GlassDropdown
                          options={folderOptions}
                          value={currentTask.folder_id || ''}
                          onChange={(val) => updateTask(currentTask.id, { folder_id: val || null })}
                          placeholder="Select folder..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsFolderModalOpen(true)}
                        className="p-2 rounded-xl bg-surface hover:bg-surface-elevated text-ink-muted hover:text-lavender-accent border border-glass-border transition-colors flex-shrink-0 cursor-pointer"
                        title="Create New Folder"
                      >
                        <PlusIcon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-ink-muted flex items-center gap-1.5">
                      <RepeatIcon size={14} className="text-lavender-accent" />
                      Repeat
                    </label>
                    <GlassDropdown
                      options={recurrenceOptions}
                      value={currentTask.recurrence_rule || ''}
                      onChange={(val) => updateTask(currentTask.id, { recurrence_rule: (val as any) || null })}
                      placeholder="Never"
                    />
                  </div>
                </div>

                {/* High-Contrast Priority Selector */}
                <div className="p-4 rounded-2xl glass-panel-subtle flex flex-col gap-2.5 relative z-10">
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
                          'py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer',
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

                {/* Subtasks Section with Drag-and-Drop */}
                <div className="p-4.5 rounded-2xl glass-panel-subtle flex flex-col gap-3.5">
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
                <div className="p-4.5 rounded-2xl glass-panel-subtle flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                    Description & Notes
                  </label>
                  <textarea
                    ref={notesTextareaRef}
                    data-task-id={currentTask.id}
                    value={localNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add detailed task notes or links..."
                    rows={3}
                    className="w-full glass-input rounded-xl p-3 text-xs sm:text-sm text-ink outline-none placeholder:text-ink-muted resize-none font-normal leading-relaxed"
                  />
                </div>

                {/* Read-Only Creator Mascot Attribution (Bottom Metadata Area) */}
                {creatorUser && (
                  <div className="p-3.5 rounded-2xl glass-panel-subtle flex items-center justify-between text-xs">
                    <span className="text-ink-muted font-bold">Created By</span>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface border border-glass-border font-bold text-ink">
                      <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={20} />
                      <span>{creatorUser.display_name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* FIXED FOOTER WITH DELETE BUTTON & METADATA */}
              <div
                className="flex-shrink-0 px-6 py-3.5 border-t border-glass-border-subtle bg-surface/80 dark:bg-[#1E1630]/85 backdrop-blur-xl flex items-center justify-between z-20"
                style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom, 0px))' }}
              >
                <div className="text-[11px] text-ink-muted font-medium">
                  {currentTask.updated_at
                    ? `Updated ${new Date(currentTask.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : ''}
                </div>
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
        description="Are you sure you want to delete this subtask?"
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

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
    </>
  )
}
