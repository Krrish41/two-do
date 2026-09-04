import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  TrashIcon,
  RestoreIcon,
  NotesIcon,
  CheckCircleIcon,
} from '../components/icons'
import { GlassButton } from '../components/glass/GlassButton'
import { GlassConfirmDialog } from '../components/glass/GlassConfirmDialog'
import { NoteCard } from '../components/notes/NoteCard'
import { CoupleAvatar } from '../components/common/CoupleAvatar'
import { useNoteStore } from '../stores/noteStore'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import { cn, formatDate } from '../lib/utils'
import { MenuBrandHeader } from '../components/layout/MenuBrandHeader'

export const RecycleBinPage: React.FC = () => {
  const navigate = useNavigate()
  const notes = useNoteStore((s) => s.notes)
  const emptyNotesRecycleBin = useNoteStore((s) => s.emptyRecycleBin)

  const tasks = useTaskStore((s) => s.tasks)
  const restoreTask = useTaskStore((s) => s.restoreTask)
  const deleteForeverTask = useTaskStore((s) => s.deleteForeverTask)
  const emptyTasksRecycleBin = useTaskStore((s) => s.emptyTasksRecycleBin)
  const allUsers = useAuthStore((s) => s.allUsers)

  const [activeTab, setActiveTab] = useState<'notes' | 'tasks'>('notes')
  const [isEmptyNotesConfirmOpen, setIsEmptyNotesConfirmOpen] = useState(false)
  const [isEmptyTasksConfirmOpen, setIsEmptyTasksConfirmOpen] = useState(false)
  const [taskToDeleteForever, setTaskToDeleteForever] = useState<string | null>(null)

  // Deleted notes
  const deletedNotes = useMemo(() => {
    return notes.filter((n) => n.deleted_at !== null)
  }, [notes])

  // Deleted tasks (parent tasks or standalone tasks)
  const deletedTasks = useMemo(() => {
    return tasks.filter((t) => t.deleted_at !== null && !t.parent_task_id)
  }, [tasks])

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl mx-auto pb-32 sm:pb-16">
      {/* Website Logo & Brand Header */}
      <MenuBrandHeader />

      {/* Back to Menu Navigation Button */}
      <div className="-mb-1">
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/80 hover:bg-surface-elevated text-ink font-bold text-xs border border-glass-border shadow-xs transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer select-none"
        >
          <ChevronLeft size={16} className="text-lavender-accent group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Menu</span>
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-ink-muted font-bold text-xs uppercase tracking-wider mb-1">
            <TrashIcon size={16} />
            <span>Trash & Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Recycle Bin</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Items in the bin are automatically purged after 30 days.
          </p>
        </div>

        {/* Empty Bin Action */}
        <div>
          {activeTab === 'notes' && deletedNotes.length > 0 && (
            <GlassButton
              variant="danger"
              size="sm"
              onClick={() => setIsEmptyNotesConfirmOpen(true)}
            >
              <TrashIcon size={14} className="mr-1.5" />
              Empty Notes Bin
            </GlassButton>
          )}

          {activeTab === 'tasks' && deletedTasks.length > 0 && (
            <GlassButton
              variant="danger"
              size="sm"
              onClick={() => setIsEmptyTasksConfirmOpen(true)}
            >
              <TrashIcon size={14} className="mr-1.5" />
              Empty Tasks Bin
            </GlassButton>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="relative inline-flex items-center gap-1 p-1 rounded-[22px] bg-slate-200/75 dark:bg-white/[0.05] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] select-none">
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={cn(
            'relative h-8 px-4 rounded-[18px] text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus:outline-none select-none',
            activeTab === 'notes' ? 'text-ink font-extrabold' : 'text-ink-muted hover:text-ink font-semibold'
          )}
        >
          {activeTab === 'notes' && (
            <motion.div
              layoutId="recycle-bin-tab-bubble"
              className="absolute inset-0 rounded-[18px] bg-white dark:bg-white/[0.14] backdrop-blur-md border border-white/80 dark:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <NotesIcon size={14} />
            <span>Notes ({deletedNotes.length})</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={cn(
            'relative h-8 px-4 rounded-[18px] text-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus:outline-none select-none',
            activeTab === 'tasks' ? 'text-ink font-extrabold' : 'text-ink-muted hover:text-ink font-semibold'
          )}
        >
          {activeTab === 'tasks' && (
            <motion.div
              layoutId="recycle-bin-tab-bubble"
              className="absolute inset-0 rounded-[18px] bg-white dark:bg-white/[0.14] backdrop-blur-md border border-white/80 dark:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <CheckCircleIcon size={14} />
            <span>Tasks ({deletedTasks.length})</span>
          </span>
        </button>
      </div>

      {/* Notes Tab Content */}
      {activeTab === 'notes' && (
        <>
          {deletedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-16 h-16 rounded-full glass-panel-subtle flex items-center justify-center mb-4 text-ink-subtle shadow-sm">
                <TrashIcon size={32} />
              </div>
              <h3 className="text-base font-bold text-ink">Notes bin is empty</h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-sm">
                Deleted notes will appear here before being permanently removed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {deletedNotes.map((note) => (
                <NoteCard key={note.id} note={note} isRecycleBin={true} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tasks Tab Content */}
      {activeTab === 'tasks' && (
        <>
          {deletedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-16 h-16 rounded-full glass-panel-subtle flex items-center justify-center mb-4 text-ink-subtle shadow-sm">
                <TrashIcon size={32} />
              </div>
              <h3 className="text-base font-bold text-ink">Tasks bin is empty</h3>
              <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-sm">
                Deleted tasks will appear here before being permanently removed.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {deletedTasks.map((task) => {
                const creatorUser = allUsers.find((u) => u.id === task.created_by)
                const subtasks = tasks.filter((t) => t.parent_task_id === task.id)

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 rounded-2xl glass-panel border border-glass-border shadow-xs"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-ink truncate line-through opacity-80">
                          {task.title}
                        </span>
                        {subtasks.length > 0 && (
                          <span className="text-[10px] font-bold text-ink-muted bg-surface px-1.5 py-0.5 rounded-md border border-glass-border">
                            +{subtasks.length} subtasks
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-ink-subtle">
                        {creatorUser && (
                          <span className="inline-flex items-center gap-1 font-semibold text-ink">
                            <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={14} />
                            <span>{creatorUser.display_name}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>Deleted {formatDate(task.deleted_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={() => restoreTask(task.id)}
                        className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                        title="Restore task"
                      >
                        <RestoreIcon size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskToDeleteForever(task.id)}
                        className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 transition-colors"
                        title="Delete permanently"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Confirmation Modals */}
      <GlassConfirmDialog
        isOpen={isEmptyNotesConfirmOpen}
        title="Empty Notes Recycle Bin?"
        description="Are you sure you want to permanently delete all notes in the Recycle Bin? This action cannot be undone."
        confirmText="Empty Bin"
        variant="danger"
        onConfirm={() => {
          setIsEmptyNotesConfirmOpen(false)
          emptyNotesRecycleBin()
        }}
        onCancel={() => setIsEmptyNotesConfirmOpen(false)}
      />

      <GlassConfirmDialog
        isOpen={isEmptyTasksConfirmOpen}
        title="Empty Tasks Recycle Bin?"
        description="Are you sure you want to permanently delete all tasks in the Recycle Bin? This action cannot be undone."
        confirmText="Empty Bin"
        variant="danger"
        onConfirm={() => {
          setIsEmptyTasksConfirmOpen(false)
          emptyTasksRecycleBin()
        }}
        onCancel={() => setIsEmptyTasksConfirmOpen(false)}
      />

      <GlassConfirmDialog
        isOpen={Boolean(taskToDeleteForever)}
        title="Delete Task Forever?"
        description="Are you sure you want to permanently delete this task and all its subtasks? This action cannot be undone."
        confirmText="Delete Forever"
        variant="danger"
        onConfirm={() => {
          if (taskToDeleteForever) {
            deleteForeverTask(taskToDeleteForever)
            setTaskToDeleteForever(null)
          }
        }}
        onCancel={() => setTaskToDeleteForever(null)}
      />
    </div>
  )
}
