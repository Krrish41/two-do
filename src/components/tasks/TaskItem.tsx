import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Check,
  Calendar,
  Sun,
  ListTree,
  ChevronRight,
} from 'lucide-react'
import type { Task } from '../../lib/database.types'
import { useTaskStore } from '../../stores/taskStore'
import { useAuthStore } from '../../stores/authStore'
import { PriorityFlag } from './PriorityFlag'
import { RecurrenceIcon } from './RecurrenceIcon'
import { cn, formatDate } from '../../lib/utils'

export interface TaskItemProps {
  task: Task
  isSubtask?: boolean
  hideCompletedDelay?: boolean
}

export const TaskItem: React.FC<TaskItemProps> = ({
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

  // Count subtasks
  const subtasks = allTasks.filter((t) => t.parent_task_id === task.id)
  const completedSubtasks = subtasks.filter((t) => t.is_completed).length

  // Find assignee
  const assignedUser = allUsers.find((u) => u.id === task.assigned_to)

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!task.is_completed && !hideCompletedDelay) {
      // Animate completion state immediately
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
        animate={{ opacity: isDragging ? 0.6 : 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={() => setSelectedTaskId(task.id)}
        className={cn(
          'group relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl glass-panel transition-all duration-200 cursor-pointer select-none',
          isChecked && 'opacity-65 bg-white/35',
          isDragging && 'shadow-2xl ring-2 ring-lavender-400 scale-[1.02]',
          isSubtask && 'ml-6 p-2.5 rounded-xl text-sm'
        )}
      >
        {/* Drag Handle */}
        {!isSubtask && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="touch-none text-ink/20 hover:text-ink/60 transition-colors p-0.5 rounded cursor-grab active:cursor-grabbing focus:outline-none"
            aria-label="Drag task to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Custom Apple Glass Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={cn(
            'relative flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-200 focus:outline-none',
            isChecked
              ? 'bg-lavender-600 border-lavender-600 text-white shadow-sm shadow-lavender-600/30'
              : 'border-ink/30 bg-white/70 hover:border-lavender-600 hover:bg-white'
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
                <Check className="w-3 h-3 stroke-[3]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Task Title & Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-medium text-sm sm:text-base text-ink break-words transition-all duration-200',
                isChecked && 'line-through text-ink/40 font-normal'
              )}
            >
              {task.title}
            </span>
            <PriorityFlag priority={task.priority} />
          </div>

          {/* Subtext and Meta Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {task.is_my_day_date && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50/90 border border-amber-200/60 px-2 py-0.5 rounded-md">
                <Sun className="w-3 h-3 text-amber-500" />
                My Day
              </span>
            )}

            {task.due_date && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink/60 bg-white/60 border border-black/5 px-2 py-0.5 rounded-md">
                <Calendar className="w-3 h-3 text-ink/40" />
                {formatDate(task.due_date)}
              </span>
            )}

            <RecurrenceIcon rule={task.recurrence_rule} />

            {subtasks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink/60 bg-white/60 border border-black/5 px-2 py-0.5 rounded-md">
                <ListTree className="w-3 h-3 text-ink/40" />
                {completedSubtasks}/{subtasks.length}
              </span>
            )}
          </div>
        </div>

        {/* Assignee Avatar Pill */}
        {assignedUser && (
          <div
            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shadow-xs border border-white/60"
            style={{ backgroundColor: assignedUser.accent_color || '#B8A9E8' }}
            title={`Assigned to ${assignedUser.display_name}`}
          >
            {assignedUser.display_name.charAt(0).toUpperCase()}
          </div>
        )}

        <ChevronRight className="w-4 h-4 text-ink/20 group-hover:text-ink/60 group-hover:translate-x-0.5 transition-all" />
      </motion.div>
    </AnimatePresence>
  )
}
