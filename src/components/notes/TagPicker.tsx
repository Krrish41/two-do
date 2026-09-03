import React, { useState } from 'react'
import { Plus, Tag as TagIcon, Check, X, SlidersHorizontal } from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'
import { ManageTagsModal } from './ManageTagsModal'
import { cn } from '../../lib/utils'

export interface TagPickerProps {
  noteId?: string
  className?: string
}

export const TagPicker: React.FC<TagPickerProps> = ({ noteId, className }) => {
  const tags = useNoteStore((s) => s.tags)
  const noteTags = useNoteStore((s) => s.noteTags)
  const toggleNoteTag = useNoteStore((s) => s.toggleNoteTag)
  const createTag = useNoteStore((s) => s.createTag)

  const [isCreating, setIsCreating] = useState(false)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedTagColor, setSelectedTagColor] = useState('#8B5CF6')

  const activeTagIds = noteId
    ? noteTags.filter((nt) => nt.note_id === noteId).map((nt) => nt.tag_id)
    : []

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    const created = await createTag(newTagName.trim(), selectedTagColor)
    if (created && noteId) {
      await toggleNoteTag(noteId, created.id)
    }
    setNewTagName('')
    setIsCreating(false)
  }

  const TAG_COLORS = ['#8B5CF6', '#3B82F6', '#EC4899', '#10B981', '#F59E0B']

  return (
    <>
      <div className={cn('flex flex-col gap-2', className)}>
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => {
            const isActive = activeTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => noteId && toggleNoteTag(noteId, tag.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all select-none cursor-pointer border',
                  isActive
                    ? 'bg-lavender-accent/25 dark:bg-lavender-accent/35 text-lavender-accent dark:text-[#E4DBF7] border-lavender-accent/50 shadow-xs font-bold'
                    : 'bg-surface/80 dark:bg-white/[0.06] text-ink-muted hover:text-ink hover:bg-surface-elevated border-glass-border font-medium'
                )}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color || '#8B5CF6' }}
                />
                <span>#{tag.name}</span>
                {isActive && <Check className="w-3 h-3 stroke-[2.5] flex-shrink-0" />}
              </button>
            )
          })}

          {!isCreating && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-lavender-accent bg-surface/50 hover:bg-lavender-accent/15 border border-dashed border-lavender-accent/40 transition-all cursor-pointer select-none"
              >
                <Plus className="w-3 h-3" />
                <span>New Tag</span>
              </button>

              {tags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-ink-muted hover:text-ink bg-surface/50 hover:bg-surface-elevated border border-glass-border transition-all cursor-pointer select-none"
                  title="Manage and delete tags"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Manage</span>
                </button>
              )}
            </div>
          )}
        </div>

        {isCreating && (
          <form
            onSubmit={handleCreateTag}
            className="flex items-center gap-2 p-2 rounded-2xl bg-surface-elevated/95 dark:bg-[#1E1630]/95 backdrop-blur-xl border border-glass-border shadow-lg max-w-sm"
          >
            <TagIcon className="w-3.5 h-3.5 text-lavender-accent ml-1 flex-shrink-0" />
            <input
              type="text"
              placeholder="Tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="bg-transparent text-xs text-ink outline-none flex-1 placeholder:text-ink-muted/50"
              autoFocus
            />
            <div className="flex items-center gap-1">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedTagColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    'w-3.5 h-3.5 rounded-full transition-transform cursor-pointer',
                    selectedTagColor === c ? 'scale-125 ring-2 ring-lavender-accent ring-offset-1 ring-offset-surface' : 'opacity-70 hover:opacity-100'
                  )}
                />
              ))}
            </div>
            <button
              type="submit"
              className="px-2.5 py-1 rounded-xl bg-lavender-accent text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 text-ink-muted hover:text-ink transition-colors cursor-pointer"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </form>
        )}
      </div>

      <ManageTagsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </>
  )
}
