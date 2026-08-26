import React from 'react'
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
} from '@dnd-kit/sortable'
import type { Task } from '../../lib/database.types'
import { TaskItem } from './TaskItem'
import { useTaskStore } from '../../stores/taskStore'
import { CheckCircle2 } from 'lucide-react'

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderTasks(String(active.id), String(over.id))
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full glass-panel-subtle flex items-center justify-center mb-4 text-lavender-600/70 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-ink">{emptyMessage}</h3>
        <p className="text-xs sm:text-sm text-ink/50 mt-1 max-w-sm">{emptySubtext}</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
