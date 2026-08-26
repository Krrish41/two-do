import React, { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle2,
  Plus,
  Search,
  Flag,
  UserCheck,
  Calendar,
  CheckCheck,
  Flame,
  Heart,
  Folder as FolderIcon,
} from 'lucide-react'
import { TaskList } from '../components/tasks/TaskList'
import { FilterSortDrawer } from '../components/common/FilterSortDrawer'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { useTaskStore } from '../stores/taskStore'
import { useAuthStore } from '../stores/authStore'
import { useNoteStore } from '../stores/noteStore'
import { useFilterSortStore } from '../stores/filterSortStore'
import { cn } from '../lib/utils'

export interface TasksPageProps {
  viewType?: 'all' | 'important' | 'completed' | 'bucket-list' | 'folder'
}

export const TasksPage: React.FC<TasksPageProps> = ({ viewType = 'all' }) => {
  const { folderId } = useParams<{ folderId?: string }>()

  const tasks = useTaskStore((s) => s.tasks)
  const addTask = useTaskStore((s) => s.addTask)

  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)
  const allUsers = useAuthStore((s) => s.allUsers)
  const folders = useNoteStore((s) => s.folders)

  const sortField = useFilterSortStore((s) => s.sortField)
  const sortDirection = useFilterSortStore((s) => s.sortDirection)
  const priorityFilter = useFilterSortStore((s) => s.priorityFilter)
  const dueDateFilter = useFilterSortStore((s) => s.dueDateFilter)

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<number>(viewType === 'important' ? 3 : 0)
  const [selectedDueDate, setSelectedDueDate] = useState<string>('')
  const [selectedRecurrence, setSelectedRecurrence] = useState<string>('')
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(authorizedUser?.id || null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(
    viewType === 'bucket-list'
      ? 'folder-bucket-list'
      : folderId || null
  )

  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'mine' | 'partner'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)

  const currentFolder = folders.find((f) => f.id === (folderId || selectedFolder))

  const rootTasks = useMemo(() => tasks.filter((t) => !t.parent_task_id), [tasks])

  const filteredAndSortedTasks = useMemo(() => {
    let result = rootTasks.filter((task) => {
      // Route View Types
      if (viewType === 'important' && task.priority < 2) return false
      if (viewType === 'completed' && !task.is_completed) return false
      if (viewType === 'bucket-list') {
        const isBucket = task.folder_id === 'folder-bucket-list' || task.title.toLowerCase().includes('bucket')
        if (!isBucket) return false
      }
      if (viewType === 'folder' && folderId && task.folder_id !== folderId) return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesNotes = task.notes?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesNotes) return false
      }

      // Assignee filter
      if (assigneeFilter === 'mine' && task.assigned_to !== authorizedUser?.id) return false
      if (assigneeFilter === 'partner' && task.assigned_to !== partnerUser?.id) return false

      // Drawer Priority Filter
      if (priorityFilter !== null && task.priority !== priorityFilter) return false

      // Drawer Due Date Filter
      if (dueDateFilter !== 'all') {
        const todayStr = new Date().toISOString().split('T')[0]
        if (dueDateFilter === 'today' && task.due_date !== todayStr) return false
        if (dueDateFilter === 'no-date' && task.due_date !== null) return false
        if (dueDateFilter === 'overdue') {
          if (!task.due_date || task.due_date >= todayStr || task.is_completed) return false
        }
        if (dueDateFilter === 'upcoming') {
          if (!task.due_date || task.due_date <= todayStr) return false
        }
      }

      return true
    })

    // Sort
    result.sort((a, b) => {
      let comp = 0
      if (sortField === 'title') {
        comp = a.title.localeCompare(b.title)
      } else if (sortField === 'created_at') {
        comp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        // default position or updated_at
        comp = a.position - b.position
      }
      return sortDirection === 'asc' ? comp : -comp
    })

    return result
  }, [
    rootTasks,
    viewType,
    folderId,
    searchQuery,
    assigneeFilter,
    priorityFilter,
    dueDateFilter,
    authorizedUser,
    partnerUser,
    sortField,
    sortDirection,
  ])

  const pendingTasks = useMemo(
    () => filteredAndSortedTasks.filter((t) => !t.is_completed),
    [filteredAndSortedTasks]
  )
  const completedTasks = useMemo(
    () => filteredAndSortedTasks.filter((t) => t.is_completed),
    [filteredAndSortedTasks]
  )

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const effectiveFolder =
      viewType === 'bucket-list'
        ? 'folder-bucket-list'
        : folderId || selectedFolder || null

    await addTask({
      title: newTaskTitle.trim(),
      priority: viewType === 'important' && selectedPriority < 2 ? 3 : selectedPriority,
      due_date: selectedDueDate || null,
      recurrence_rule: selectedRecurrence || null,
      assigned_to: selectedAssignee || authorizedUser?.id,
      folder_id: effectiveFolder,
    })

    setNewTaskTitle('')
    if (viewType !== 'important') setSelectedPriority(0)
    setSelectedDueDate('')
    setSelectedRecurrence('')
  }

  const getHeaderInfo = () => {
    switch (viewType) {
      case 'important':
        return {
          badge: 'High Priority',
          icon: Flame,
          color: 'text-rose-500',
          title: 'Important Tasks',
          subtitle: 'Urgent priorities and high-impact action items.',
        }
      case 'completed':
        return {
          badge: 'Archive',
          icon: CheckCheck,
          color: 'text-emerald-500',
          title: 'Completed Tasks',
          subtitle: 'All finished deliverables and shared accomplishments.',
        }
      case 'bucket-list':
        return {
          badge: 'Dreams & Goals',
          icon: Heart,
          color: 'text-blossom-accent',
          title: 'Bucket List',
          subtitle: 'Adventures, shared goals, and things you want to do together.',
        }
      case 'folder':
        return {
          badge: 'Folder',
          icon: FolderIcon,
          color: 'text-lavender-accent',
          title: currentFolder ? `${currentFolder.icon || '📁'} ${currentFolder.name}` : 'Folder Tasks',
          subtitle: 'Tasks organized inside this project container.',
        }
      case 'all':
      default:
        return {
          badge: 'Workspace',
          icon: CheckCircle2,
          color: 'text-lavender-accent',
          title: 'All Tasks',
          subtitle: 'Organize, prioritize, and collaborate on shared tasks.',
        }
    }
  }

  const { badge, icon: HeaderIcon, color, title, subtitle } = getHeaderInfo()

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className={cn('flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1', color)}>
            <HeaderIcon className="w-4 h-4" />
            <span>{badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{title}</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">{subtitle}</p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <GlassInput
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Quick Add Task (Hidden on pure completed view) */}
      {viewType !== 'completed' && (
        <GlassCard variant="default" className="p-4 shadow-glass">
          <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-lavender-accent flex-shrink-0" />
              <input
                type="text"
                placeholder={
                  viewType === 'bucket-list'
                    ? 'Add a new bucket list dream...'
                    : 'Add a new task...'
                }
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base font-medium text-ink placeholder:text-ink-muted outline-none"
              />
              <GlassButton type="submit" size="sm" variant="primary" disabled={!newTaskTitle.trim()}>
                Add Task
              </GlassButton>
            </div>

            {/* Quick Options */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-glass-border-subtle text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Priority Chips */}
                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-glass-border-subtle">
                  <Flag className="w-3 h-3 text-ink-muted ml-1" />
                  {[
                    { val: 0, label: 'P0' },
                    { val: 1, label: 'P1' },
                    { val: 2, label: 'P2' },
                    { val: 3, label: 'P3' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setSelectedPriority(p.val)}
                      className={cn(
                        'px-2 py-0.5 rounded-lg font-bold transition-all text-[11px]',
                        selectedPriority === p.val
                          ? 'bg-lavender-accent text-white shadow-xs'
                          : 'text-ink-muted hover:text-ink'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Assignee Chips */}
                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-glass-border-subtle">
                  <UserCheck className="w-3 h-3 text-ink-muted ml-1" />
                  {allUsers.map((u) => {
                    const isSel = (selectedAssignee || authorizedUser?.id) === u.id
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedAssignee(u.id)}
                        className={cn(
                          'px-2 py-0.5 rounded-lg font-semibold transition-all text-[11px] flex items-center gap-1',
                          isSel ? 'bg-surface-elevated text-ink shadow-xs font-bold' : 'text-ink-muted hover:text-ink'
                        )}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: u.accent_color }}
                        />
                        <span>{u.display_name}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Due Date Input */}
                <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-xl border border-glass-border-subtle">
                  <Calendar className="w-3 h-3 text-ink-muted" />
                  <input
                    type="date"
                    value={selectedDueDate}
                    onChange={(e) => setSelectedDueDate(e.target.value)}
                    className="bg-transparent text-[11px] font-semibold text-ink outline-none cursor-pointer"
                  />
                </div>

                {/* Folder dropdown if creating from all view */}
                {viewType === 'all' && folders.length > 0 && (
                  <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-xl border border-glass-border-subtle">
                    <FolderIcon className="w-3 h-3 text-ink-muted" />
                    <select
                      value={selectedFolder || ''}
                      onChange={(e) => setSelectedFolder(e.target.value || null)}
                      className="bg-transparent text-[11px] font-semibold text-ink outline-none cursor-pointer"
                    >
                      <option value="">No Folder</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.icon || '📁'} {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Toolbar: Assignee Filter Tabs + Filter & Sort Drawer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel-subtle">
          {[
            { id: 'all', label: 'All' },
            { id: 'mine', label: 'Mine' },
            { id: 'partner', label: partnerUser?.display_name || 'Partner' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAssigneeFilter(tab.id as any)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
                assigneeFilter === tab.id
                  ? 'bg-surface-elevated text-ink shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <FilterSortDrawer showDueDateFilter={true} showFolderFilter={viewType === 'all'} />
      </div>

      {/* Pending Tasks List */}
      {viewType !== 'completed' && (
        <TaskList
          tasks={pendingTasks}
          emptyMessage={
            viewType === 'bucket-list'
              ? 'No bucket list items yet'
              : viewType === 'important'
              ? 'No high priority items pending'
              : 'No pending tasks'
          }
          emptySubtext="Add new items using the field above or switch active filters."
        />
      )}

      {/* Completed Tasks Accordion */}
      {completedTasks.length > 0 && viewType !== 'completed' && (
        <div className="mt-4 pt-4 border-t border-glass-border-subtle flex flex-col gap-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink transition-colors w-fit"
          >
            <CheckCheck className="w-4 h-4 text-emerald-500" />
            <span>Completed ({completedTasks.length})</span>
          </button>

          {showCompleted && (
            <div className="flex flex-col gap-2 opacity-80">
              {completedTasks.map((task) => (
                <TaskList key={task.id} tasks={[task]} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pure Completed View */}
      {viewType === 'completed' && (
        <TaskList
          tasks={completedTasks}
          emptyMessage="No completed tasks yet"
          emptySubtext="Complete tasks to celebrate achievements together here!"
        />
      )}
    </div>
  )
}
