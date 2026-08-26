import { create } from 'zustand'

export type SortField = 'updated_at' | 'created_at' | 'title'
export type SortDirection = 'asc' | 'desc'
export type DueDateFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'no-date'

interface FilterSortState {
  sortField: SortField
  sortDirection: SortDirection
  priorityFilter: number | null
  dueDateFilter: DueDateFilter
  isDrawerOpen: boolean

  // Actions
  setSortField: (field: SortField) => void
  toggleSortDirection: () => void
  setPriorityFilter: (priority: number | null) => void
  setDueDateFilter: (filter: DueDateFilter) => void
  setIsDrawerOpen: (isOpen: boolean) => void
  resetFilters: () => void
}

export const useFilterSortStore = create<FilterSortState>((set, get) => ({
  sortField: 'updated_at',
  sortDirection: 'desc',
  priorityFilter: null,
  dueDateFilter: 'all',
  isDrawerOpen: false,

  setSortField: (field) => {
    if (get().sortField === field) {
      get().toggleSortDirection()
    } else {
      set({ sortField: field, sortDirection: field === 'title' ? 'asc' : 'desc' })
    }
  },

  toggleSortDirection: () => {
    set({ sortDirection: get().sortDirection === 'asc' ? 'desc' : 'asc' })
  },

  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setDueDateFilter: (filter) => set({ dueDateFilter: filter }),
  setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

  resetFilters: () =>
    set({
      sortField: 'updated_at',
      sortDirection: 'desc',
      priorityFilter: null,
      dueDateFilter: 'all',
    }),
}))
