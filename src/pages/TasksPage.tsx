import React, { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircleIcon,
  PlusIcon,
  SearchIcon,
  CheckCheckIcon,
  FlameIcon,
  HeartIcon,
  FolderIcon,
} from '../components/icons'
import { TaskList } from '../components/tasks/TaskList'
import { FilterSortDrawer } from '../components/common/FilterSortDrawer'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { GlassDatePicker } from '../components/glass/GlassDatePicker'
import { GlassDropdown } from '../components/glass/GlassDropdown'
import { CoupleAvatar } from '../components/common/CoupleAvatar'
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
  const folders = useNoteStore((s) => s.folders)

  const sortField = useFilterSortStore((s) => s.sortField)
  const sortDirection = useFilterSortStore((s) => s.sortDirection)
  const priorityFilter = useFilterSortStore((s) => s.priorityFilter)
  const dueDateFilter = useFilterSortStore((s) => s.dueDateFilter)

  // Resolve Bucket List UUID from loaded folders list
  const bucketListFolder = folders.find(
    (f) => f.slug === 'bucket-list' || (f.is_system && f.name === 'Bucket List')
  )
  const bucketListFolderId = bucketListFolder?.id || null

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<number>(viewType === 'important' ? 3 : 0)
  const [selectedDueDate, setSelectedDueDate] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(
    viewType === 'bucket-list' ? bucketListFolderId : folderId || null
  )

  const [creatorFilter, setCreatorFilter] = useState<'all' | 'mine' | 'partner'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)

  const currentFolder = folders.find((f) => f.id === (folderId || selectedFolder))

  // Exclude system folders from dropdown options to prevent repetition (Section 6)
  const assignableFolders = folders.filter((f) => !f.is_system && f.slug !== 'bucket-list')
  const folderDropdownOptions = [
    { value: '', label: 'No Folder', icon: <FolderIcon size={14} className="text-ink-muted" /> },
    ...assignableFolders.map((f) => ({
      value: f.id,
      label: f.name,
      icon: <span>{f.icon || '📁'}</span>,
    })),
  ]

  // Root tasks excluding soft-deleted ones
  const rootTasks = useMemo(() => tasks.filter((t) => !t.parent_task_id && t.deleted_at === null), [tasks])

  const filteredAndSortedTasks = useMemo(() => {
    let result = rootTasks.filter((task) => {
      // Route View Types
      if (viewType === 'important' && task.priority < 2) return false
      if (viewType === 'completed' && !task.is_completed) return false
      if (viewType === 'bucket-list') {
        const isBucket =
          (bucketListFolderId && task.folder_id === bucketListFolderId) ||
          task.title.toLowerCase().includes('bucket')
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

      // Creator filter
      if (creatorFilter === 'mine' && task.created_by !== authorizedUser?.id) return false
      if (creatorFilter === 'partner' && task.created_by !== partnerUser?.id) return false

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
        comp = a.position - b.position
      }
      return sortDirection === 'asc' ? comp : -comp
    })

    return result
  }, [
    rootTasks,
    viewType,
    folderId,
    bucketListFolderId,
    searchQuery,
    creatorFilter,
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
        ? bucketListFolderId
        : folderId || selectedFolder || null

    await addTask({
      title: newTaskTitle.trim(),
      priority: viewType === 'important' && selectedPriority < 2 ? 3 : selectedPriority,
      due_date: selectedDueDate,
      folder_id: effectiveFolder,
    })

    setNewTaskTitle('')
    if (viewType !== 'important') setSelectedPriority(0)
    setSelectedDueDate(null)
  }

  const getHeaderInfo = () => {
    switch (viewType) {
      case 'important':
        return {
          badge: 'High Priority',
          icon: FlameIcon,
          color: 'text-rose-500',
          title: 'Important Tasks',
          subtitle: 'Urgent priorities and high-impact action items.',
        }
      case 'completed':
        return {
          badge: 'Archive',
          icon: CheckCheckIcon,
          color: 'text-emerald-500',
          title: 'Completed Tasks',
          subtitle: 'All finished deliverables and shared accomplishments.',
        }
      case 'bucket-list':
        return {
          badge: 'Bucket List',
          icon: HeartIcon,
          color: 'text-blossom-accent',
          title: 'Bucket List',
          subtitle: 'Things we wanna do together 💕',
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
          icon: CheckCircleIcon,
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
            <HeaderIcon size={16} />
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
            icon={<SearchIcon size={16} />}
          />
        </div>
      </div>

      {/* Quick Add Task */}
      {viewType !== 'completed' && (
        <GlassCard variant="default" className="p-4 shadow-glass border border-glass-border">
          <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <PlusIcon size={20} className="text-lavender-accent flex-shrink-0" />
              <input
                type="text"
                placeholder={
                  viewType === 'bucket-list'
                    ? 'Add a new dream to the list...'
                    : 'Add a new task...'
                }
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-ink placeholder:text-ink-muted outline-none"
              />
              <GlassButton type="submit" size="sm" variant="primary" disabled={!newTaskTitle.trim()}>
                Add Task
              </GlassButton>
            </div>

            {/* Quick Options: High Contrast Priority Chips & Glass Custom Pickers */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-glass-border-subtle text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Priority Selector with High Contrast Styling */}
                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-glass-border">
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
                        'px-2.5 py-1 rounded-lg font-bold transition-all text-xs border',
                        selectedPriority === p.val
                          ? 'bg-lavender-accent text-white border-lavender-accent shadow-xs'
                          : 'bg-surface text-ink border-transparent hover:bg-surface-elevated'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Custom Glass Date Picker */}
                <GlassDatePicker
                  value={selectedDueDate}
                  onChange={(d) => setSelectedDueDate(d)}
                  size="sm"
                />

                {/* Custom Glass Dropdown for Folder (excluding Bucket List to avoid repetition) */}
                {viewType === 'all' && assignableFolders.length > 0 && (
                  <GlassDropdown
                    options={folderDropdownOptions}
                    value={selectedFolder || ''}
                    onChange={(val) => setSelectedFolder(val || null)}
                    placeholder="No Folder"
                    size="sm"
                  />
                )}
              </div>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Toolbar: Creator Filter Tabs with Mascot Avatars + Filter & Sort Drawer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel-subtle border border-glass-border">
          <button
            onClick={() => setCreatorFilter('all')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
              creatorFilter === 'all'
                ? 'bg-surface-elevated text-ink shadow-sm border border-glass-border'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            All
          </button>

          {authorizedUser && (
            <button
              onClick={() => setCreatorFilter('mine')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                creatorFilter === 'mine'
                  ? 'bg-surface-elevated text-ink shadow-sm border border-glass-border'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <CoupleAvatar userId={authorizedUser.id} displayName={authorizedUser.display_name} size={16} />
              <span>{authorizedUser.display_name}</span>
            </button>
          )}

          {partnerUser && (
            <button
              onClick={() => setCreatorFilter('partner')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                creatorFilter === 'partner'
                  ? 'bg-surface-elevated text-ink shadow-sm border border-glass-border'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <CoupleAvatar userId={partnerUser.id} displayName={partnerUser.display_name} size={16} />
              <span>{partnerUser.display_name}</span>
            </button>
          )}
        </div>

        <FilterSortDrawer showDueDateFilter={true} showFolderFilter={viewType === 'all'} />
      </div>

      {/* Pending Tasks List */}
      {viewType !== 'completed' && (
        <TaskList
          tasks={pendingTasks}
          emptyMessage={
            viewType === 'bucket-list'
              ? 'No bucket list items yet 💕'
              : viewType === 'important'
              ? 'No high priority items pending'
              : 'No pending tasks'
          }
          emptySubtext={
            viewType === 'bucket-list'
              ? 'Add things you wanna do together using the box above.'
              : 'Add new items using the field above or switch active filters.'
          }
        />
      )}

      {/* Completed Tasks Accordion */}
      {completedTasks.length > 0 && viewType !== 'completed' && (
        <div className="mt-4 pt-4 border-t border-glass-border-subtle flex flex-col gap-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink transition-colors w-fit"
          >
            <CheckCheckIcon size={16} className="text-emerald-500" />
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
