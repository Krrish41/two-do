import React, { useState, useMemo } from 'react'
import {
  NotesIcon,
  PlusIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  PinIcon,
} from '../components/icons'
import { NoteCard } from '../components/notes/NoteCard'
import { NoteEditor } from '../components/notes/NoteEditor'
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { CoupleAvatar } from '../components/common/CoupleAvatar'
import { useNoteStore } from '../stores/noteStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

export const NotesPage: React.FC = () => {
  const notes = useNoteStore((s) => s.notes)
  const folders = useNoteStore((s) => s.folders)
  const noteTags = useNoteStore((s) => s.noteTags)
  const addNote = useNoteStore((s) => s.addNote)
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId)

  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagId] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [creatorFilter, setCreatorFilter] = useState<'all' | 'mine' | 'partner'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const assignableFolders = folders.filter((f) => !f.is_system && f.slug !== 'bucket-list')

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (n.deleted_at !== null) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = n.title.toLowerCase().includes(query)
        const matchesContent = JSON.stringify(n.content).toLowerCase().includes(query)
        if (!matchesTitle && !matchesContent) return false
      }

      if (selectedFolderId && n.folder_id !== selectedFolderId) return false

      if (selectedTagId) {
        const hasTag = noteTags.some((nt) => nt.note_id === n.id && nt.tag_id === selectedTagId)
        if (!hasTag) return false
      }

      if (creatorFilter === 'mine' && n.created_by !== authorizedUser?.id) return false
      if (creatorFilter === 'partner' && n.created_by !== partnerUser?.id) return false

      return true
    })
  }, [notes, searchQuery, selectedFolderId, selectedTagId, creatorFilter, authorizedUser, partnerUser, noteTags])

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.is_pinned), [filteredNotes])
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.is_pinned), [filteredNotes])

  const handleCreateNote = async () => {
    const newNote = await addNote({
      title: 'Untitled Note',
      folder_id: selectedFolderId,
    })
    if (newNote) {
      setSelectedNoteId(newNote.id)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-skyblue-accent font-bold text-xs uppercase tracking-wider mb-1">
            <NotesIcon size={16} />
            <span>Shared Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Notes</h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Rich-text documents, meeting notes, recipes, and ideas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-2xl glass-panel-subtle border border-glass-border">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-xl transition-all',
                viewMode === 'grid'
                  ? 'bg-lavender-accent text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              )}
              title="Grid View"
            >
              <GridIcon size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-xl transition-all',
                viewMode === 'list'
                  ? 'bg-lavender-accent text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              )}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>

          <GlassButton variant="primary" size="md" onClick={handleCreateNote}>
            <PlusIcon size={18} className="mr-1.5" />
            New Note
          </GlassButton>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Creator Tabs with Mascot Avatars */}
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

        {/* Search */}
        <div className="w-full sm:w-64">
          <GlassInput
            type="text"
            placeholder="Search notes or #tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<SearchIcon size={16} />}
          />
        </div>
      </div>

      {/* Folder Chips */}
      {assignableFolders.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap',
              selectedFolderId === null
                ? 'bg-lavender-accent text-white border-lavender-accent shadow-xs'
                : 'bg-surface text-ink-muted hover:text-ink border-glass-border hover:bg-surface-elevated'
            )}
          >
            All Notes
          </button>
          {assignableFolders.map((folder) => {
            const isSelected = selectedFolderId === folder.id
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => setSelectedFolderId(isSelected ? null : folder.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap',
                  isSelected
                    ? 'bg-lavender-accent text-white border-lavender-accent shadow-xs'
                    : 'bg-surface text-ink-muted hover:text-ink border-glass-border hover:bg-surface-elevated'
                )}
              >
                <span>{folder.icon || '📁'}</span>
                <span>{folder.name}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-lavender-accent uppercase tracking-wider">
            <PinIcon size={14} className="fill-current" />
            <span>Pinned ({pinnedNotes.length})</span>
          </div>

          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
                : 'flex flex-col gap-2.5'
            )}
          >
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))}
          </div>
        </div>
      )}

      {/* Main Notes List */}
      <div className="flex flex-col gap-3">
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <div className="text-xs font-bold text-ink-muted uppercase tracking-wider pt-2">
            <span>Other Notes ({otherNotes.length})</span>
          </div>
        )}

        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
            <div className="w-16 h-16 rounded-full glass-panel-subtle flex items-center justify-center mb-4 text-skyblue-accent shadow-sm">
              <NotesIcon size={32} />
            </div>
            <h3 className="text-base font-bold text-ink">No notes found</h3>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-sm">
              Create your first note to capture ideas, meeting notes, recipes, or thoughts together.
            </p>
            <div className="mt-4">
              <GlassButton variant="primary" size="sm" onClick={handleCreateNote}>
                <PlusIcon size={16} className="mr-1" />
                Create Note
              </GlassButton>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
                : 'flex flex-col gap-2.5'
            )}
          >
            {otherNotes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>

      {/* Full Modal Rich-Text Note Editor */}
      <NoteEditor />
    </div>
  )
}
