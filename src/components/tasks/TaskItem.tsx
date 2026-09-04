import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripIcon,
  CheckIcon,
  CalendarIcon,
  SunIcon,
  ListIcon,
} from '../icons'
import type { Task } from '../../lib/database.types'
import { useTaskStore } from '../../stores/taskStore'
import { useAuthStore } from '../../stores/authStore'
import { PriorityFlag } from './PriorityFlag'
import { RecurrenceIcon } from './RecurrenceIcon'
import { CoupleAvatar } from '../common/CoupleAvatar'
import { cn, formatDate } from '../../lib/utils'

export interface TaskItemProps {
  task: Task
  isSubtask?: boolean
  hideCompletedDelay?: boolean
}

export const TaskItem: React.FC<TaskItemProps> = React.memo(({
  task,
  isSubtask = false,
  hideCompletedDelay = false,
}) => {
  const toggleComplete = useTaskStore((s) => s.toggleComplete)
  const setSelectedTaskId = useTaskStore((s) => s.setSelectedTaskId)
  const allTasks = useTaskStore((s) => s.tasks)
  const allUsers = useAuthStore((s) => s.allUsers)

  const [isPendingComplete, setIsPendingComplete] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  }

  // Count subtasks (excluding deleted)
  const subtasks = allTasks.filter((t) => t.parent_task_id === task.id && t.deleted_at === null)
  const completedSubtasks = subtasks.filter((t) => t.is_completed).length

  // Find creator for read-only nickname attribution
  const creatorUser = allUsers.find((u) => u.id === task.created_by)

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!task.is_completed && !hideCompletedDelay) {
      setIsPendingComplete(true)
      setTimeout(async () => {
        await toggleComplete(task.id)
        setIsPendingComplete(false)
      }, 400)
    } else {
      await toggleComplete(task.id)
    }
  }

  const isChecked = task.is_completed || isPendingComplete

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={() => setSelectedTaskId(task.id)}
      data-task-item="true"
      className={cn(
          'group relative flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer select-none border',
          isChecked
            ? 'opacity-60 bg-surface-subtle/50 border-glass-border-subtle'
            : 'bg-white/[0.7] dark:bg-white/[0.04] hover:bg-white/[0.9] dark:hover:bg-white/[0.07] border-white/80 dark:border-white/[0.08] hover:border-lavender-accent/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)]',
          isDragging && 'shadow-2xl ring-2 ring-lavender-accent scale-[1.02]',
          isSubtask && 'ml-6 p-2 rounded-xl text-sm'
        )}
      >
        {/* Drag Handle */}
        {!isSubtask && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="touch-none text-ink-subtle/50 hover:text-ink transition-colors p-0.5 -ml-1 rounded cursor-grab active:cursor-grabbing focus:outline-none opacity-40 group-hover:opacity-100"
            aria-label="Drag task to reorder"
          >
            <GripIcon size={14} />
          </button>
        )}

        {/* Custom Apple Glass Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={cn(
            'relative flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none border-2',
            isChecked
              ? 'bg-lavender-accent border-lavender-accent text-white shadow-xs'
              : 'border-[#683CB8]/40 dark:border-white/30 hover:border-lavender-accent hover:scale-105 bg-transparent'
          )}
          aria-label={isChecked ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <AnimatePresence>
            {isChecked && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              >
                <CheckIcon size={11} className="stroke-[3]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Task Title & Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium text-sm sm:text-[15px] text-ink break-words transition-all duration-200 leading-snug',
                isChecked && 'line-through text-ink-muted font-normal'
              )}
            >
              {task.title}
            </span>
            <PriorityFlag priority={task.priority} />
          </div>

          {/* Subtext and Meta Chips */}
          {(task.is_my_day_date || task.due_date || task.recurrence_rule || subtasks.length > 0 || creatorUser) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {task.is_my_day_date && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                  <SunIcon size={11} className="text-amber-500" />
                  <span>Today</span>
                </span>
              )}

              {task.due_date && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-ink-muted bg-surface/70 border border-glass-border px-1.5 py-0.5 rounded-md">
                  <CalendarIcon size={11} className="text-ink-subtle" />
                  <span>{formatDate(task.due_date)}</span>
                </span>
              )}

              <RecurrenceIcon rule={task.recurrence_rule} />

              {subtasks.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-ink-muted bg-surface/70 border border-glass-border px-1.5 py-0.5 rounded-md">
                  <ListIcon size={11} className="text-ink-subtle" />
                  <span>{completedSubtasks}/{subtasks.length}</span>
                </span>
              )}

              {/* Couple Mascot Avatar attribution */}
              {creatorUser && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-ink-muted/80 bg-surface/50 px-1.5 py-0.5 rounded-full border border-glass-border-subtle">
                  <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={13} />
                  <span className="truncate max-w-[80px]">{creatorUser.display_name}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
  )
})
