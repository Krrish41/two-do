import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripIcon,
  CheckIcon,
  CalendarIcon,
  SunIcon,
  ChevronRightIcon,
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
    <AnimatePresence mode="popLayout">
      <motion.div
        ref={setNodeRef}
        style={style}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={() => setSelectedTaskId(task.id)}
        className={cn(
          'group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel transition-all duration-200 cursor-pointer select-none',
          isChecked && 'opacity-65 bg-surface-subtle',
          isDragging && 'shadow-2xl ring-2 ring-lavender-accent scale-[1.02]',
          isSubtask && 'ml-6 p-2.5 rounded-xl text-sm'
        )}
      >
        {/* Drag Handle */}
        {!isSubtask && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="touch-none text-ink-subtle hover:text-ink transition-colors p-0.5 rounded cursor-grab active:cursor-grabbing focus:outline-none"
            aria-label="Drag task to reorder"
          >
            <GripIcon size={16} />
          </button>
        )}

        {/* Custom Apple Glass Checkbox with High-Contrast Border */}
        <button
          onClick={handleCheckboxClick}
          className={cn(
            'relative flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none checkbox-glass',
            isChecked
              ? 'bg-lavender-accent border-lavender-accent text-white shadow-sm shadow-lavender-accent/30'
              : 'bg-surface hover:border-lavender-accent'
          )}
          aria-label={isChecked ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <AnimatePresence>
            {isChecked && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <CheckIcon size={12} className="stroke-[3]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Task Title & Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-semibold text-sm sm:text-base text-ink break-words transition-all duration-200',
                isChecked && 'line-through text-ink-muted font-normal'
              )}
            >
              {task.title}
            </span>
            <PriorityFlag priority={task.priority} />
          </div>

          {/* Subtext and Meta Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {task.is_my_day_date && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                <SunIcon size={12} className="text-amber-500" />
                Today
              </span>
            )}

            {task.due_date && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted bg-surface border border-glass-border px-2 py-0.5 rounded-md">
                <CalendarIcon size={12} className="text-ink-subtle" />
                {formatDate(task.due_date)}
              </span>
            )}

            <RecurrenceIcon rule={task.recurrence_rule} />

            {subtasks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted bg-surface border border-glass-border px-2 py-0.5 rounded-md">
                <ListIcon size={12} className="text-ink-subtle" />
                {completedSubtasks}/{subtasks.length}
              </span>
            )}

            {/* Couple Mascot Avatar Read-only Attribution */}
            {creatorUser && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink bg-surface px-2 py-0.5 rounded-full border border-glass-border">
                <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={16} />
                <span>Added by {creatorUser.display_name}</span>
              </span>
            )}
          </div>
        </div>

        <ChevronRightIcon size={16} className="text-ink-subtle group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
      </motion.div>
    </AnimatePresence>
  )
})
