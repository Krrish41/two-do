import React, { useState, useMemo } from 'react'
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  Folder as FolderIcon,
  Tag as TagIcon,
  X,
} from 'lucide-react'
import { NoteCard } from '../components/notes/NoteCard'
import { FolderTree } from '../components/notes/FolderTree'
import { GlassCard } from '../components/glass/GlassCard'
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { useNoteStore } from '../stores/noteStore'
import { cn } from '../lib/utils'

export const NotesPage: React.FC = () => {
  const notes = useNoteStore((s) => s.notes)
  const addNote = useNoteStore((s) => s.addNote)
  const folders = useNoteStore((s) => s.folders)
  const tags = useNoteStore((s) => s.tags)
  const noteTags = useNoteStore((s) => s.noteTags)
  const selectedFolderId = useNoteStore((s) => s.selectedFolderId)
  const setSelectedFolderId = useNoteStore((s) => s.setSelectedFolderId)
  const selectedTagId = useNoteStore((s) => s.selectedTagId)
  const setSelectedTagId = useNoteStore((s) => s.setSelectedTagId)

  const [searchQuery, setSearchQuery] = useState('')

  const activeFolder = folders.find((f) => f.id === selectedFolderId)
  const activeTag = tags.find((t) => t.id === selectedTagId)

  // Filter notes based on folder, tag, search query
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Folder filter
      if (selectedFolderId && note.folder_id !== selectedFolderId) {
        return false
      }

      // Tag filter
      if (selectedTagId) {
        const isTagAttached = noteTags.some(
          (nt) => nt.note_id === note.id && nt.tag_id === selectedTagId
        )
        if (!isTagAttached) return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = note.title.toLowerCase().includes(q)
        const matchContent = JSON.stringify(note.content).toLowerCase().includes(q)
        if (!matchTitle && !matchContent) return false
      }

      return true
    })
  }, [notes, selectedFolderId, selectedTagId, noteTags, searchQuery])

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.is_pinned), [filteredNotes])
  const unpinnedNotes = useMemo(() => filteredNotes.filter((n) => !n.is_pinned), [filteredNotes])

  const handleCreateNote = async () => {
    await addNote({
      title: 'Untitled Note',
      folder_id: selectedFolderId,
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-skyblue-600 font-bold text-xs uppercase tracking-wider mb-1">
            <StickyNote className="w-4 h-4" />
            <span>Notes & Ideas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Shared Notebook
          </h1>
          <p className="text-xs sm:text-sm text-ink/60 mt-0.5">
            Collaborative rich-text notes, checklists, brainstorms, and specs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-full sm:w-60">
            <GlassInput
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <GlassButton onClick={handleCreateNote} variant="primary" size="md" className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            New Note
          </GlassButton>
        </div>
      </div>

      {/* Main Layout: Folder Nav + Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Folders & Tags Sidebar Column */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <GlassCard variant="default" className="p-4 shadow-glass">
            <FolderTree />

            {/* Tag Filter List */}
            <div className="mt-6 pt-4 border-t border-black/5 flex flex-col gap-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-ink/60 uppercase tracking-wider flex items-center gap-1.5">
                  <TagIcon className="w-3 h-3" />
                  Filter by Tag
                </span>
                {selectedTagId && (
                  <button
                    onClick={() => setSelectedTagId(null)}
                    className="text-[11px] text-ink/50 hover:text-ink"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 px-1 mt-1">
                {tags.map((tag) => {
                  const isSel = selectedTagId === tag.id
                  return (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedTagId(isSel ? null : tag.id)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                        isSel
                          ? 'bg-white shadow-xs border-ink/40 ring-1 ring-ink/20 font-bold'
                          : 'bg-white/40 border-black/5 text-ink/70 hover:bg-white/70'
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Notes Grid Column */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {/* Active Filter Chips Bar */}
          {(activeFolder || activeTag || searchQuery) && (
            <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle text-xs">
              <span className="font-semibold text-ink/60">Active filter:</span>

              {activeFolder && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl shadow-2xs font-medium">
                  <FolderIcon className="w-3 h-3 text-lavender-600" />
                  Folder: {activeFolder.name}
                  <button onClick={() => setSelectedFolderId(null)} className="ml-1 text-ink/40 hover:text-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {activeTag && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl shadow-2xs font-medium">
                  <TagIcon className="w-3 h-3 text-skyblue-600" />
                  Tag: {activeTag.name}
                  <button onClick={() => setSelectedTagId(null)} className="ml-1 text-ink/40 hover:text-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl shadow-2xs font-medium">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 text-ink/40 hover:text-ink">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Empty State */}
          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-full glass-panel-subtle flex items-center justify-center mb-4 text-skyblue-600/70 shadow-sm">
                <StickyNote className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-ink">No notes found</h3>
              <p className="text-xs sm:text-sm text-ink/50 mt-1 max-w-sm">
                Create your first rich-text note or adjust your filters.
              </p>
              <GlassButton onClick={handleCreateNote} variant="secondary" size="sm" className="mt-4">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Note
              </GlassButton>
            </div>
          )}

          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink/60 uppercase tracking-wider">
                <Pin className="w-3.5 h-3.5 fill-current" />
                <span>Pinned ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes Section */}
          {unpinnedNotes.length > 0 && (
            <div className="flex flex-col gap-3">
              {pinnedNotes.length > 0 && (
                <div className="text-xs font-bold text-ink/60 uppercase tracking-wider">
                  Other Notes ({unpinnedNotes.length})
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {unpinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
