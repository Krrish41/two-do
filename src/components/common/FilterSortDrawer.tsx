import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SortIcon,
  FilterIcon,
  CloseIcon,
  FlagIcon,
  CalendarIcon,
  FolderIcon,
} from '../icons'
import { GlassButton } from '../glass/GlassButton'
import {
  useFilterSortStore,
  type SortField,
  type DueDateFilter,
} from '../../stores/filterSortStore'
import { useNoteStore } from '../../stores/noteStore'
import { cn } from '../../lib/utils'

export interface FilterSortDrawerProps {
  showDueDateFilter?: boolean
  showFolderFilter?: boolean
}

export const FilterSortDrawer: React.FC<FilterSortDrawerProps> = ({
  showDueDateFilter = true,
  showFolderFilter = true,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const sortField = useFilterSortStore((s) => s.sortField)
  const sortDirection = useFilterSortStore((s) => s.sortDirection)
  const priorityFilter = useFilterSortStore((s) => s.priorityFilter)
  const dueDateFilter = useFilterSortStore((s) => s.dueDateFilter)
  const folderFilter = useFilterSortStore((s) => s.folderFilter)

  const setSortField = useFilterSortStore((s) => s.setSortField)
  const setSortDirection = useFilterSortStore((s) => s.setSortDirection)
  const setPriorityFilter = useFilterSortStore((s) => s.setPriorityFilter)
  const setDueDateFilter = useFilterSortStore((s) => s.setDueDateFilter)
  const setFolderFilter = useFilterSortStore((s) => s.setFolderFilter)
  const resetFilters = useFilterSortStore((s) => s.resetFilters)

  const folders = useNoteStore((s) => s.folders)
  const assignableFolders = folders.filter((f) => !f.is_system && f.slug !== 'bucket-list')

  const hasActiveFilters =
    priorityFilter !== null || dueDateFilter !== 'all' || folderFilter !== null

  return (
    <>
      {/* Trigger Button */}
      <GlassButton
        variant={hasActiveFilters ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 font-bold"
      >
        <FilterIcon size={14} />
        <span>Sort & Filter</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-white ml-0.5 animate-pulse" />
        )}
      </GlassButton>

      {/* Drawer Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Dialog Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-md glass-panel-elevated p-6 rounded-3xl shadow-2xl border border-glass-border z-10 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-glass-border-subtle">
                <div className="flex items-center gap-2">
                  <FilterIcon size={18} className="text-lavender-accent" />
                  <h3 className="font-extrabold text-lg text-ink tracking-tight">Sort & Filter</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {/* Sort By Section */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <SortIcon size={14} className="text-lavender-accent" />
                  Sort By
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { field: 'position' as SortField, label: 'Manual Order' },
                    { field: 'created_at' as SortField, label: 'Date Created' },
                    { field: 'title' as SortField, label: 'Title (A–Z)' },
                  ].map(({ field, label }) => {
                    const isSelected = sortField === field
                    return (
                      <button
                        key={field}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                          } else {
                            setSortField(field)
                            setSortDirection('asc')
                          }
                        }}
                        className={cn(
                          'p-2.5 rounded-xl text-xs font-bold transition-all border text-center flex items-center justify-center gap-1',
                          isSelected
                            ? 'bg-lavender-accent text-white border-lavender-accent shadow-xs'
                            : 'bg-surface text-ink border-glass-border hover:bg-surface-elevated'
                        )}
                      >
                        <span className="truncate">{label}</span>
                        {isSelected && (
                          <span className="text-[10px] ml-0.5">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Priority Filter Section */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                  <FlagIcon size={14} className="text-lavender-accent" />
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
                        key={p.label}
                        type="button"
                        onClick={() => setPriorityFilter(p.val)}
                        className={cn(
                          'p-2 rounded-xl text-xs font-bold transition-all border text-center',
                          isSelected
                            ? 'bg-lavender-accent text-white border-lavender-accent shadow-xs'
                            : 'bg-surface text-ink border-glass-border hover:bg-surface-elevated'
                        )}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Due Date Filter Section */}
              {showDueDateFilter && (
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarIcon size={14} className="text-lavender-accent" />
                    Due Date
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'all' as DueDateFilter, label: 'All Dates' },
                      { val: 'today' as DueDateFilter, label: 'Due Today' },
                      { val: 'upcoming' as DueDateFilter, label: 'Upcoming' },
                      { val: 'overdue' as DueDateFilter, label: 'Overdue' },
                      { val: 'no-date' as DueDateFilter, label: 'No Date' },
                    ].map((d) => {
                      const isSelected = dueDateFilter === d.val
                      return (
                        <button
                          key={d.val}
                          type="button"
                          onClick={() => setDueDateFilter(d.val)}
                          className={cn(
                            'p-2 rounded-xl text-xs font-bold transition-all border text-center',
                            isSelected
                              ? 'bg-lavender-accent text-white border-lavender-accent shadow-xs'
                              : 'bg-surface text-ink border-glass-border hover:bg-surface-elevated'
                          )}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Folder Filter Section */}
              {showFolderFilter && assignableFolders.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                    <FolderIcon size={14} className="text-lavender-accent" />
                    Folder
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => setFolderFilter(null)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
                        folderFilter === null
                          ? 'bg-lavender-accent text-white border-lavender-accent shadow-xs'
                          : 'bg-surface text-ink border-glass-border hover:bg-surface-elevated'
                      )}
                    >
                      All Folders
                    </button>
                    {assignableFolders.map((f) => {
                      const isSelected = folderFilter === f.id
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setFolderFilter(f.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5',
                            isSelected
                              ? 'bg-lavender-accent text-white border-lavender-accent shadow-xs'
                              : 'bg-surface text-ink border-glass-border hover:bg-surface-elevated'
                          )}
                        >
                          <span>{f.icon || '📁'}</span>
                          <span>{f.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-glass-border-subtle mt-2">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-rose-500 hover:underline px-2 py-1"
                >
                  Reset All
                </button>
                <GlassButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setIsOpen(false)}
                  className="font-bold px-6 shadow-md"
                >
                  Apply Filters
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
