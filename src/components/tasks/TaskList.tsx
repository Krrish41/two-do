import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { Task } from '../../lib/database.types'
import { TaskItem } from './TaskItem'
import { useTaskStore } from '../../stores/taskStore'
import { CheckCircleIcon } from '../icons'

export interface TaskListProps {
  tasks: Task[]
  emptyMessage?: string
  emptySubtext?: string
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  emptyMessage = 'No tasks yet',
  emptySubtext = 'Add a task above or take a well-deserved break.',
}) => {
  const reorderTasks = useTaskStore((s) => s.reorderTasks)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [overTaskId, setOverTaskId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id))
    setOverTaskId(null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    setOverTaskId(event.over ? String(event.over.id) : null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderTasks(String(active.id), String(over.id))
    }
    setActiveTaskId(null)
    setOverTaskId(null)
  }

  // Filter out any soft-deleted tasks
  const activeTasks = tasks.filter((t) => t.deleted_at === null)

  if (activeTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
        <div className="w-16 h-16 rounded-full glass-panel-subtle flex items-center justify-center mb-4 text-lavender-accent shadow-sm">
          <CheckCircleIcon size={32} />
        </div>
        <h3 className="text-base font-bold text-ink">{emptyMessage}</h3>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-sm">{emptySubtext}</p>
      </div>
    )
  }

  const activeTask = activeTasks.find((t) => t.id === activeTaskId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveTaskId(null)
        setOverTaskId(null)
      }}
    >
      <SortableContext items={activeTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5">
          {activeTasks.map((task) => (
            <React.Fragment key={task.id}>
              {/* Visible Drop Placeholder when hovering over item */}
              {activeTaskId && overTaskId === task.id && activeTaskId !== task.id && (
                <div className="dnd-drop-placeholder animate-pulse" />
              )}
              <TaskItem task={task} />
            </React.Fragment>
          ))}
        </div>
      </SortableContext>

      {/* Floating DragOverlay */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? (
          <div className="shadow-2xl ring-2 ring-lavender-accent rounded-2xl glass-panel-elevated scale-105 opacity-95">
            <TaskItem task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
