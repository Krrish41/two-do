import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag as TagIcon, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'
import { GlassConfirmDialog } from '../glass/GlassConfirmDialog'
import { cn } from '../../lib/utils'
import type { Tag } from '../../lib/database.types'

export interface ManageTagsModalProps {
  isOpen: boolean
  onClose: () => void
}

const PRESET_COLORS = [
  '#8B5CF6', // Lavender
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
]

export const ManageTagsModal: React.FC<ManageTagsModalProps> = ({ isOpen, onClose }) => {
  const tags = useNoteStore((s) => s.tags)
  const noteTags = useNoteStore((s) => s.noteTags)
  const createTag = useNoteStore((s) => s.createTag)
  const updateTag = useNoteStore((s) => s.updateTag)
  const deleteTag = useNoteStore((s) => s.deleteTag)

  // Creation State
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0])
  const [isCreating, setIsCreating] = useState(false)

  // Editing State
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingTagName, setEditingTagName] = useState('')
  const [editingTagColor, setEditingTagColor] = useState('')

  // Delete Confirmation
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    await createTag(newTagName.trim(), newTagColor)
    setNewTagName('')
    setIsCreating(false)
  }

  const startEditing = (tag: Tag) => {
    setEditingTagId(tag.id)
    setEditingTagName(tag.name)
    setEditingTagColor(tag.color || PRESET_COLORS[0])
  }

  const cancelEditing = () => {
    setEditingTagId(null)
    setEditingTagName('')
    setEditingTagColor('')
  }

  const handleSaveEdit = async (id: string) => {
    if (!editingTagName.trim()) return
    await updateTag(id, {
      name: editingTagName.trim(),
      color: editingTagColor,
    })
    cancelEditing()
  }

  const confirmDelete = async () => {
    if (!tagToDelete) return
    await deleteTag(tagToDelete.id)
    setTagToDelete(null)
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="relative w-full max-w-md glass-panel-elevated p-6 rounded-3xl shadow-2xl z-10 border border-glass-border flex flex-col gap-4 max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-glass-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-lavender-accent/15 flex items-center justify-center text-lavender-accent">
                    <TagIcon size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-ink tracking-tight">Manage Tags</h3>
                    <p className="text-xs text-ink-muted">Edit, color-code, or remove note tags</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-ink-muted hover:text-ink hover:bg-surface transition-colors"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tag Creation Form / Button */}
              {isCreating ? (
                <form
                  onSubmit={handleCreate}
                  className="p-3.5 rounded-2xl bg-surface/80 border border-glass-border flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink-muted">#</span>
                    <input
                      type="text"
                      placeholder="tag-name..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-ink outline-none placeholder:text-ink-muted/50"
                      autoFocus
                    />
                  </div>

                  {/* Color Selector */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-glass-border-subtle">
                    <div className="flex items-center gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewTagColor(c)}
                          style={{ backgroundColor: c }}
                          className={cn(
                            'w-4 h-4 rounded-full transition-transform cursor-pointer',
                            newTagColor === c ? 'scale-125 ring-2 ring-lavender-accent ring-offset-1 ring-offset-surface' : 'opacity-70 hover:opacity-100'
                          )}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-xl bg-lavender-accent text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-dashed border-lavender-accent/40 text-lavender-accent hover:bg-lavender-accent/10 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create New Tag</span>
                </button>
              )}

              {/* Tag List */}
              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[48vh] pr-1 scrollbar-none">
                {tags.length === 0 ? (
                  <div className="py-8 text-center text-xs text-ink-muted">
                    No tags created yet. Use tags to categorize your notes and ideas.
                  </div>
                ) : (
                  tags.map((tag) => {
                    const count = noteTags.filter((nt) => nt.tag_id === tag.id).length
                    const isEditing = editingTagId === tag.id

                    if (isEditing) {
                      return (
                        <div
                          key={tag.id}
                          className="p-3 rounded-2xl bg-surface-elevated border border-lavender-accent/40 flex flex-col gap-2.5 shadow-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-lavender-accent">#</span>
                            <input
                              type="text"
                              value={editingTagName}
                              onChange={(e) => setEditingTagName(e.target.value)}
                              className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-ink outline-none"
                              autoFocus
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-glass-border-subtle">
                            <div className="flex items-center gap-1.5">
                              {PRESET_COLORS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setEditingTagColor(c)}
                                  style={{ backgroundColor: c }}
                                  className={cn(
                                    'w-4 h-4 rounded-full transition-transform cursor-pointer',
                                    editingTagColor === c ? 'scale-125 ring-2 ring-lavender-accent ring-offset-1 ring-offset-surface' : 'opacity-70 hover:opacity-100'
                                  )}
                                />
                              ))}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(tag.id)}
                                className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                                title="Save changes"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={tag.id}
                        className="flex items-center justify-between p-2.5 px-3 rounded-2xl bg-surface/60 hover:bg-surface border border-glass-border transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color || '#8B5CF6' }}
                          />
                          <span className="text-xs sm:text-sm font-semibold text-ink truncate">
                            #{tag.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-subtle text-ink-muted flex-shrink-0">
                            {count} {count === 1 ? 'note' : 'notes'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => startEditing(tag)}
                            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated transition-colors cursor-pointer"
                            title="Edit Tag"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTagToDelete(tag)}
                            className="p-1.5 rounded-lg text-ink-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete Tag"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Tag Confirmation Dialog */}
      <GlassConfirmDialog
        isOpen={Boolean(tagToDelete)}
        title={`Delete #${tagToDelete?.name || ''}?`}
        description={
          tagToDelete
            ? `This will permanently delete this tag and un-tag ${
                noteTags.filter((nt) => nt.tag_id === tagToDelete.id).length
              } note(s). The notes themselves will not be deleted.`
            : ''
        }
        confirmText="Delete Tag"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setTagToDelete(null)}
      />
    </>
  )
}
