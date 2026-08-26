import React, { useMemo } from 'react'
import {
  StickyNote,
  Plus,
  Search,
  LayoutGrid,
  List,
  Pin,
} from 'lucide-react'
import { NoteCard } from '../components/notes/NoteCard'
import { TagPillBar } from '../components/notes/TagPillBar'
import { FilterSortDrawer } from '../components/common/FilterSortDrawer'
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { useNoteStore } from '../stores/noteStore'
import { useFilterSortStore } from '../stores/filterSortStore'
import { cn } from '../lib/utils'

export const NotesPage: React.FC = () => {
  const notes = useNoteStore((s) => s.notes)
  const addNote = useNoteStore((s) => s.addNote)
  const folders = useNoteStore((s) => s.folders)
  const selectedFolderId = useNoteStore((s) => s.selectedFolderId)
  const selectedTagIds = useNoteStore((s) => s.selectedTagIds)
  const noteTags = useNoteStore((s) => s.noteTags)
  const searchQuery = useNoteStore((s) => s.searchQuery)
  const setSearchQuery = useNoteStore((s) => s.setSearchQuery)
  const viewMode = useNoteStore((s) => s.viewMode)
  const setViewMode = useNoteStore((s) => s.setViewMode)

  const sortField = useFilterSortStore((s) => s.sortField)
  const sortDirection = useFilterSortStore((s) => s.sortDirection)

  const activeFolder = folders.find((f) => f.id === selectedFolderId)

  // Filter & Sort active (non-deleted) notes
  const activeNotes = useMemo(() => {
    return notes.filter((n) => n.deleted_at === null)
  }, [notes])

  const filteredAndSortedNotes = useMemo(() => {
    let result = activeNotes.filter((note) => {
      // Folder filter
      if (selectedFolderId && note.folder_id !== selectedFolderId) {
        return false
      }

      // Tag filter (multi-select, AND logic)
      if (selectedTagIds.length > 0) {
        const attachedTagIds = noteTags.filter((nt) => nt.note_id === note.id).map((nt) => nt.tag_id)
        const hasAllSelectedTags = selectedTagIds.every((id) => attachedTagIds.includes(id))
        if (!hasAllSelectedTags) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = note.title.toLowerCase().includes(q)
        const matchContent = JSON.stringify(note.content).toLowerCase().includes(q)
        if (!matchTitle && !matchContent) return false
      }

      return true
    })

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else {
        comparison = new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime()
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [activeNotes, selectedFolderId, selectedTagIds, noteTags, searchQuery, sortField, sortDirection])

  const pinnedNotes = useMemo(
    () => filteredAndSortedNotes.filter((n) => n.is_pinned),
    [filteredAndSortedNotes]
  )
  const unpinnedNotes = useMemo(
    () => filteredAndSortedNotes.filter((n) => !n.is_pinned),
    [filteredAndSortedNotes]
  )

  const handleCreateNote = async () => {
    await addNote({
      title: 'Untitled Note',
      folder_id: selectedFolderId,
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-skyblue-accent font-bold text-xs uppercase tracking-wider mb-1">
            <StickyNote className="w-4 h-4" />
            <span>Notes & Memos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            {activeFolder ? `${activeFolder.icon || '📁'} ${activeFolder.name}` : 'Shared Notebook'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Rich-text memos, lists, brainstorming, and hashtag-organized thoughts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-full sm:w-60">
            <GlassInput
              type="text"
              placeholder="Search notes or #tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <GlassButton onClick={handleCreateNote} variant="primary" size="md" className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            New Note
          </GlassButton>
        </div>
      </div>

      {/* Toolbar: Tag Pill Bar + Dual View Toggle + Filter/Sort Drawer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-2xl glass-panel-subtle">
        <div className="flex-1 min-w-0">
          <TagPillBar />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <FilterSortDrawer showDueDateFilter={false} />

          {/* Dual View Mode Toggle */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-glass-border-subtle">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                viewMode === 'grid'
                  ? 'bg-lavender-accent text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              )}
              title="Masonry Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                viewMode === 'list'
                  ? 'bg-lavender-accent text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              )}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full glass-panel-subtle flex items-center justify-center mb-4 text-skyblue-accent">
            <StickyNote className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-base font-semibold text-ink">No notes found</h3>
          <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-sm">
            Create your first pastel glass note or adjust your active tag filters.
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
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink-muted uppercase tracking-wider">
            <Pin className="w-3.5 h-3.5 fill-current text-lavender-accent" />
            <span>Pinned ({pinnedNotes.length})</span>
          </div>

          <div
            style={
              viewMode === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }
                : { display: 'flex', flexDirection: 'column', gap: '0.625rem' }
            }
          >
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))}
          </div>
        </div>
      )}

      {/* Unpinned Notes Section */}
      {unpinnedNotes.length > 0 && (
        <div className="flex flex-col gap-3">
          {pinnedNotes.length > 0 && (
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Notes ({unpinnedNotes.length})
            </div>
          )}

          <div
            style={
              viewMode === 'grid'
                ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }
                : { display: 'flex', flexDirection: 'column', gap: '0.625rem' }
            }
          >
            {unpinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
