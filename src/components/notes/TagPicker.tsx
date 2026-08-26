import React, { useState } from 'react'
import { Plus, Tag as TagIcon, Check } from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'
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
  const [newTagName, setNewTagName] = useState('')
  const [selectedTagColor, setSelectedTagColor] = useState('#A7C7E7')

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

  const TAG_COLORS = ['#A7C7E7', '#F5A9C9', '#C4AEF0', '#B8E1D9', '#FCE38A']

  return (
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
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all select-none',
                isActive
                  ? 'bg-white shadow-xs border-ink/30 ring-1 ring-ink/20 font-semibold'
                  : 'bg-white/40 border-black/5 text-ink/70 hover:bg-white/70'
              )}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color || '#A7C7E7' }}
              />
              <span>{tag.name}</span>
              {isActive && <Check className="w-3 h-3 text-ink ml-0.5 stroke-[2.5]" />}
            </button>
          )
        })}

        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-ink/60 hover:text-ink bg-white/30 hover:bg-white/60 border border-black/5 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>New Tag</span>
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreateTag} className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-black/5">
          <TagIcon className="w-3.5 h-3.5 text-ink/50 ml-1" />
          <input
            type="text"
            placeholder="Tag name..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="bg-transparent text-xs text-ink outline-none flex-1 placeholder:text-ink/40"
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
                  'w-3.5 h-3.5 rounded-full',
                  selectedTagColor === c && 'ring-1 ring-black ring-offset-1'
                )}
              />
            ))}
          </div>
          <button
            type="submit"
            className="px-2 py-0.5 rounded-lg bg-lavender-600 text-white text-xs font-medium"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="text-xs text-ink/50 hover:text-ink"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  )
}
