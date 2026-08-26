import { create } from 'zustand'

export type SortField = 'position' | 'updated_at' | 'created_at' | 'title'
export type SortDirection = 'asc' | 'desc'
export type DueDateFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'no-date'

interface FilterSortState {
  sortField: SortField
  sortDirection: SortDirection
  priorityFilter: number | null
  dueDateFilter: DueDateFilter
  folderFilter: string | null
  isDrawerOpen: boolean

  // Actions
  setSortField: (field: SortField) => void
  setSortDirection: (direction: SortDirection) => void
  toggleSortDirection: () => void
  setPriorityFilter: (priority: number | null) => void
  setDueDateFilter: (filter: DueDateFilter) => void
  setFolderFilter: (folderId: string | null) => void
  setIsDrawerOpen: (isOpen: boolean) => void
  resetFilters: () => void
}

export const useFilterSortStore = create<FilterSortState>((set, get) => ({
  sortField: 'position',
  sortDirection: 'asc',
  priorityFilter: null,
  dueDateFilter: 'all',
  folderFilter: null,
  isDrawerOpen: false,

  setSortField: (field) => set({ sortField: field }),
  setSortDirection: (direction) => set({ sortDirection: direction }),
  toggleSortDirection: () =>
    set({ sortDirection: get().sortDirection === 'asc' ? 'desc' : 'asc' }),

  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setDueDateFilter: (filter) => set({ dueDateFilter: filter }),
  setFolderFilter: (folderId) => set({ folderFilter: folderId }),
  setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

  resetFilters: () =>
    set({
      sortField: 'position',
      sortDirection: 'asc',
      priorityFilter: null,
      dueDateFilter: 'all',
      folderFilter: null,
    }),
}))
