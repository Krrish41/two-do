import React, { useState } from 'react'
import { X, Check, SlidersHorizontal, Plus } from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'
import { ManageTagsModal } from './ManageTagsModal'
import { cn } from '../../lib/utils'

export interface TagPillBarProps {
  className?: string
  wrap?: boolean
  prefixChildren?: React.ReactNode
}

export const TagPillBar: React.FC<TagPillBarProps> = ({ className, wrap = false, prefixChildren }) => {
  const tags = useNoteStore((s) => s.tags)
  const selectedTagIds = useNoteStore((s) => s.selectedTagIds)
  const toggleTagFilter = useNoteStore((s) => s.toggleTagFilter)
  const clearTagFilters = useNoteStore((s) => s.clearTagFilters)

  const [isManageModalOpen, setIsManageModalOpen] = useState(false)

  const containerClasses = cn(
    wrap ? 'flex flex-wrap items-center gap-1.5 select-none' : 'flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none',
    className
  )
  const innerClasses = cn('flex items-center gap-1.5', wrap ? 'flex-wrap' : 'flex-nowrap')

  return (
    <>
      <div className={containerClasses}>
        <div className={innerClasses}>
          {prefixChildren}

          {prefixChildren && tags.length > 0 && (
            <div className="h-3.5 w-px bg-glass-border mx-0.5 self-center flex-shrink-0" />
          )}

          {selectedTagIds.length > 0 && (
            <button
              type="button"
              onClick={clearTagFilters}
              className="flex-shrink-0 h-7 inline-flex items-center gap-1 px-2.5 rounded-full text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear ({selectedTagIds.length})</span>
            </button>
          )}

          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTagFilter(tag.id)}
                className={cn(
                  'flex-shrink-0 h-7 inline-flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer',
                  isSelected
                    ? 'bg-lavender-accent text-white shadow-xs border-transparent scale-105'
                    : 'glass-panel-subtle text-ink/70 hover:text-ink hover:bg-surface'
                )}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color || '#C4AEF0' }}
                />
                <span>#{tag.name}</span>
                {isSelected && <Check className="w-3 h-3 ml-0.5 stroke-[3]" />}
              </button>
            )
          })}

          {tags.length === 0 ? (
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="flex-shrink-0 h-7 inline-flex items-center gap-1.5 px-2.5 rounded-full text-xs font-semibold text-ink-muted hover:text-lavender-accent border border-dashed border-glass-border hover:border-lavender-accent/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Tag</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="flex-shrink-0 h-7 inline-flex items-center gap-1 px-2.5 rounded-full text-xs font-semibold text-ink-muted hover:text-ink bg-surface/40 hover:bg-surface border border-glass-border transition-all cursor-pointer"
              title="Manage and delete tags"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Manage</span>
            </button>
          )}
        </div>
      </div>

      <ManageTagsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </>
  )
}
