import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  RotateCcw,
  Calendar,
  Flag,
  Folder as FolderIcon,
} from 'lucide-react'
import { useFilterSortStore, type SortField, type DueDateFilter } from '../../stores/filterSortStore'
import { useNoteStore } from '../../stores/noteStore'
import { GlassButton } from '../glass/GlassButton'
import { cn } from '../../lib/utils'

export interface FilterSortDrawerProps {
  showDueDateFilter?: boolean
  showFolderFilter?: boolean
}

export const FilterSortDrawer: React.FC<FilterSortDrawerProps> = ({
  showDueDateFilter = true,
  showFolderFilter = true,
}) => {
  const sortField = useFilterSortStore((s) => s.sortField)
  const sortDirection = useFilterSortStore((s) => s.sortDirection)
  const priorityFilter = useFilterSortStore((s) => s.priorityFilter)
  const dueDateFilter = useFilterSortStore((s) => s.dueDateFilter)
  const isDrawerOpen = useFilterSortStore((s) => s.isDrawerOpen)
  const setSortField = useFilterSortStore((s) => s.setSortField)
  const toggleSortDirection = useFilterSortStore((s) => s.toggleSortDirection)
  const setPriorityFilter = useFilterSortStore((s) => s.setPriorityFilter)
  const setDueDateFilter = useFilterSortStore((s) => s.setDueDateFilter)
  const setIsDrawerOpen = useFilterSortStore((s) => s.setIsDrawerOpen)
  const resetFilters = useFilterSortStore((s) => s.resetFilters)

  const folders = useNoteStore((s) => s.folders)
  const selectedFolderId = useNoteStore((s) => s.selectedFolderId)
  const setSelectedFolderId = useNoteStore((s) => s.setSelectedFolderId)

  const hasActiveFilters =
    priorityFilter !== null ||
    (showDueDateFilter && dueDateFilter !== 'all') ||
    (showFolderFilter && selectedFolderId !== null) ||
    sortField !== 'updated_at' ||
    sortDirection !== 'desc'

  const sortOptions: { id: SortField; label: string }[] = [
    { id: 'updated_at', label: 'Date Edited' },
    { id: 'created_at', label: 'Date Created' },
    { id: 'title', label: 'Title (A–Z)' },
  ]

  const dueDateOptions: { id: DueDateFilter; label: string }[] = [
    { id: 'all', label: 'All Dates' },
    { id: 'today', label: 'Due Today' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'no-date', label: 'No Date' },
  ]

  return (
    <>
      {/* Trigger Button (Visible in toolbars) */}
      <button
        type="button"
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold glass-panel-subtle transition-all select-none',
          hasActiveFilters
            ? 'bg-lavender-500/15 border-lavender-accent text-lavender-accent ring-1 ring-lavender-accent/30'
            : 'text-ink-muted hover:text-ink hover:bg-surface'
        )}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sort & Filter</span>
        {hasActiveFilters && (
          <span className="w-1.5 h-1.5 rounded-full bg-lavender-accent animate-pulse" />
        )}
      </button>

      {/* Modal / Bottom Sheet Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Sheet / Modal Content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="relative w-full sm:max-w-md glass-panel-elevated p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-glass-border-subtle mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-lavender-accent" />
                  <h3 className="font-bold text-base text-ink">Sort & Filter</h3>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-surface-subtle"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-surface text-ink-muted hover:text-ink"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-5 text-xs">
                {/* Sort Field */}
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-ink-muted uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Sort By
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {sortOptions.map((opt) => {
                      const isSelected = sortField === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSortField(opt.id)}
                          className={cn(
                            'p-2.5 rounded-xl font-semibold border transition-all flex items-center justify-between text-left',
                            isSelected
                              ? 'bg-lavender-accent/15 border-lavender-accent text-lavender-accent ring-1 ring-lavender-accent/30'
                              : 'glass-panel-subtle hover:bg-surface text-ink-muted hover:text-ink'
                          )}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isSelected && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSortDirection()
                              }}
                              className="p-0.5 ml-1 rounded hover:bg-surface"
                            >
                              {sortDirection === 'asc' ? (
                                <ArrowUp className="w-3 h-3" />
                              ) : (
                                <ArrowDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-ink-muted uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5" />
                    Priority
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { val: null, label: 'All' },
                      { val: 0, label: 'None' },
                      { val: 1, label: 'Low (P1)' },
                      { val: 2, label: 'Med (P2)' },
                      { val: 3, label: 'Urg (P3)' },
                    ].map((p) => {
                      const isSelected = priorityFilter === p.val
                      return (
                        <button
                          key={String(p.val)}
                          type="button"
                          onClick={() => setPriorityFilter(p.val)}
                          className={cn(
                            'py-2 px-1 rounded-xl font-semibold border text-center transition-all text-[11px]',
                            isSelected
                              ? 'bg-lavender-accent text-white shadow-xs border-transparent'
                              : 'glass-panel-subtle hover:bg-surface text-ink-muted hover:text-ink'
                          )}
                        >
                          {p.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Due Date Filter (For Tasks) */}
                {showDueDateFilter && (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-ink-muted uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Due Date
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {dueDateOptions.map((opt) => {
                        const isSelected = dueDateFilter === opt.id
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setDueDateFilter(opt.id)}
                            className={cn(
                              'p-2 rounded-xl font-semibold border text-center transition-all',
                              isSelected
                                ? 'bg-skyblue-accent/20 border-skyblue-accent text-skyblue-accent'
                                : 'glass-panel-subtle hover:bg-surface text-ink-muted hover:text-ink'
                            )}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Folder Filter */}
                {showFolderFilter && folders.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-ink-muted uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FolderIcon className="w-3.5 h-3.5" />
                      Folder Filter
                    </label>
                    <select
                      value={selectedFolderId || ''}
                      onChange={(e) => setSelectedFolderId(e.target.value || null)}
                      className="glass-input rounded-xl p-2.5 text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="">All Folders</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.icon || '📁'} {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-2">
                  <GlassButton
                    onClick={() => setIsDrawerOpen(false)}
                    variant="primary"
                    size="md"
                    className="w-full"
                  >
                    Apply Filters
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
