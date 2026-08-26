import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { Task } from '../lib/database.types'
import { useAuthStore } from './authStore'

export type TaskFilter = 'all' | 'my-day' | 'assigned-to-me' | 'assigned-to-partner' | 'completed'

interface TaskState {
  tasks: Task[]
  loading: boolean
  selectedTaskId: string | null
  filter: TaskFilter
  searchQuery: string

  // Actions
  fetchTasks: () => Promise<void>
  addTask: (params: {
    title: string
    notes?: string | null
    due_date?: string | null
    is_my_day_date?: string | null
    priority?: number
    recurrence_rule?: string | null
    assigned_to?: string | null
    parent_task_id?: string | null
  }) => Promise<Task | null>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  toggleMyDay: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  reorderTasks: (activeId: string, overId: string) => Promise<void>
  setSelectedTaskId: (id: string | null) => void
  setFilter: (filter: TaskFilter) => void
  setSearchQuery: (query: string) => void
  receiveRealtimeTask: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: Task | null
    old: { id: string } | null
  }) => void
}

const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    title: 'Review weekly roadmap & deliverables',
    notes: 'Make sure our sprint goals align and check database performance.',
    parent_task_id: null,
    due_date: new Date().toISOString().split('T')[0],
    is_my_day_date: new Date().toISOString().split('T')[0],
    priority: 3,
    is_completed: false,
    completed_at: null,
    recurrence_rule: 'WEEKLY',
    position: 100,
    created_by: 'demo-user-1',
    assigned_to: 'demo-user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-task-2',
    title: 'Sync Supabase RLS security policies',
    notes: 'Verify is_authorized() definer check on all tables.',
    parent_task_id: null,
    due_date: new Date().toISOString().split('T')[0],
    is_my_day_date: new Date().toISOString().split('T')[0],
    priority: 2,
    is_completed: false,
    completed_at: null,
    recurrence_rule: null,
    position: 200,
    created_by: 'demo-user-2',
    assigned_to: 'demo-user-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-task-3',
    title: 'Design Apple Glassy components with spring motion',
    notes: 'Custom blur, lavender/skyblue/blossom palette tokens.',
    parent_task_id: null,
    due_date: null,
    is_my_day_date: null,
    priority: 1,
    is_completed: true,
    completed_at: new Date().toISOString(),
    recurrence_rule: null,
    position: 300,
    created_by: 'demo-user-1',
    assigned_to: 'demo-user-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  selectedTaskId: null,
  filter: 'my-day',
  searchQuery: '',

  fetchTasks: async () => {
    set({ loading: true })

    if (!isSupabaseConfigured) {
      if (get().tasks.length === 0) {
        set({ tasks: INITIAL_DEMO_TASKS, loading: false })
      } else {
        set({ loading: false })
      }
      return
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw error

      if (data) {
        set({ tasks: data })
      }
    } catch (err: unknown) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      set({ loading: false })
    }
  },

  addTask: async (params) => {
    const authUser = useAuthStore.getState().authorizedUser
    const currentTasks = get().tasks

    // Calculate next position
    const minPosition = currentTasks.length > 0 ? Math.min(...currentTasks.map((t) => t.position)) : 0
    const newPosition = minPosition - 100 // place at top by default

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: params.title.trim(),
      notes: params.notes || null,
      parent_task_id: params.parent_task_id || null,
      due_date: params.due_date || null,
      is_my_day_date: params.is_my_day_date || null,
      priority: params.priority ?? 0,
      is_completed: false,
      completed_at: null,
      recurrence_rule: params.recurrence_rule || null,
      position: newPosition,
      created_by: authUser?.id || null,
      assigned_to: params.assigned_to || authUser?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Optimistic insert
    set({ tasks: [newTask, ...currentTasks] })

    if (!isSupabaseConfigured) {
      return newTask
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          id: newTask.id,
          title: newTask.title,
          notes: newTask.notes,
          parent_task_id: newTask.parent_task_id,
          due_date: newTask.due_date,
          is_my_day_date: newTask.is_my_day_date,
          priority: newTask.priority,
          is_completed: newTask.is_completed,
          completed_at: newTask.completed_at,
          recurrence_rule: newTask.recurrence_rule,
          position: newTask.position,
          created_by: newTask.created_by,
          assigned_to: newTask.assigned_to,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        // Replace with server record
        set({
          tasks: get().tasks.map((t) => (t.id === newTask.id ? data : t)),
        })
        return data
      }
    } catch (err) {
      console.error('Error inserting task:', err)
      // Rollback
      set({ tasks: currentTasks })
      return null
    }

    return newTask
  },

  updateTask: async (id, updates) => {
    const prevTasks = get().tasks
    const updated = prevTasks.map((t) =>
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    )

    set({ tasks: updated })

    if (!isSupabaseConfigured) return

    try {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('Failed to update task:', err)
      set({ tasks: prevTasks })
    }
  },

  toggleComplete: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return

    const nextCompleted = !task.is_completed
    const nextCompletedAt = nextCompleted ? new Date().toISOString() : null

    await get().updateTask(id, {
      is_completed: nextCompleted,
      completed_at: nextCompletedAt,
    })
  },

  toggleMyDay: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return

    const todayStr = new Date().toISOString().split('T')[0]
    const nextMyDay = task.is_my_day_date ? null : todayStr

    await get().updateTask(id, {
      is_my_day_date: nextMyDay,
    })
  },

  deleteTask: async (id) => {
    const prevTasks = get().tasks
    set({
      tasks: prevTasks.filter((t) => t.id !== id && t.parent_task_id !== id),
      selectedTaskId: get().selectedTaskId === id ? null : get().selectedTaskId,
    })

    if (!isSupabaseConfigured) return

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('Failed to delete task:', err)
      set({ tasks: prevTasks })
    }
  },

  reorderTasks: async (activeId, overId) => {
    if (activeId === overId) return

    const currentTasks = [...get().tasks]
    const activeIndex = currentTasks.findIndex((t) => t.id === activeId)
    const overIndex = currentTasks.findIndex((t) => t.id === overId)

    if (activeIndex === -1 || overIndex === -1) return

    const [movedTask] = currentTasks.splice(activeIndex, 1)
    currentTasks.splice(overIndex, 0, movedTask)

    // Recompute float positions with intervals
    const updatedWithPositions = currentTasks.map((t, idx) => ({
      ...t,
      position: (idx + 1) * 100,
    }))

    set({ tasks: updatedWithPositions })

    if (!isSupabaseConfigured) return

    try {
      const moved = updatedWithPositions.find((t) => t.id === activeId)
      if (moved) {
        await supabase
          .from('tasks')
          .update({ position: moved.position })
          .eq('id', activeId)
      }
    } catch (err) {
      console.error('Failed to persist task reorder:', err)
    }
  },

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  receiveRealtimeTask: ({ eventType, new: newRecord, old: oldRecord }) => {
    const currentTasks = get().tasks

    if (eventType === 'INSERT' && newRecord) {
      if (!currentTasks.some((t) => t.id === newRecord.id)) {
        set({ tasks: [newRecord, ...currentTasks] })
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      set({
        tasks: currentTasks.map((t) => (t.id === newRecord.id ? newRecord : t)),
      })
    } else if (eventType === 'DELETE' && oldRecord) {
      set({
        tasks: currentTasks.filter((t) => t.id !== oldRecord.id),
      })
    }
  },
}))
