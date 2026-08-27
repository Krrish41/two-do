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
import { FolderIconRenderer } from '../components/common/FolderIconRenderer'
import { CreateFolderModal } from '../components/common/CreateFolderModal'
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

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)

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
      {/* Header */}
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

        {/* View Mode & New Note Action */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-surface border border-glass-border">
            <button
              onClick={() => setViewMode('grid')}
              style={
                viewMode === 'grid'
                  ? { background: 'linear-gradient(135deg, #683CB8 0%, #1B6CB5 100%)', color: '#FFFFFF' }
                  : {}
              }
              className={cn(
                'p-2 rounded-xl transition-all',
                viewMode === 'grid'
                  ? 'border border-white/20 shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              )}
              title="Grid View"
            >
              <GridIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={
                viewMode === 'list'
                  ? { background: 'linear-gradient(135deg, #683CB8 0%, #1B6CB5 100%)', color: '#FFFFFF' }
                  : {}
              }
              className={cn(
                'p-2 rounded-xl transition-all',
                viewMode === 'list'
                  ? 'border border-white/20 shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              )}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>

          <GlassButton
            variant="primary"
            size="md"
            onClick={handleCreateNote}
            className="flex items-center gap-2"
          >
            <PlusIcon size={18} />
            <span>New Note</span>
          </GlassButton>
        </div>
      </div>

      {/* Toolbar: Creator Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-2xl glass-panel-subtle border border-glass-border max-w-full overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setCreatorFilter('all')}
            className={cn(
              'h-8 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center whitespace-nowrap select-none border',
              creatorFilter === 'all'
                ? 'bg-surface-elevated text-ink shadow-xs border-glass-border'
                : 'text-ink-muted hover:text-ink border-transparent'
            )}
          >
            All Notes
          </button>

          {authorizedUser && (
            <button
              type="button"
              onClick={() => setCreatorFilter('mine')}
              className={cn(
                'h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap select-none border',
                creatorFilter === 'mine'
                  ? 'bg-surface-elevated text-ink shadow-xs border-glass-border'
                  : 'text-ink-muted hover:text-ink border-transparent'
              )}
            >
              <CoupleAvatar userId={authorizedUser.id} displayName={authorizedUser.display_name} size={16} />
              <span>{authorizedUser.display_name}</span>
            </button>
          )}

          {partnerUser && (
            <button
              type="button"
              onClick={() => setCreatorFilter('partner')}
              className={cn(
                'h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap select-none border',
                creatorFilter === 'partner'
                  ? 'bg-surface-elevated text-ink shadow-xs border-glass-border'
                  : 'text-ink-muted hover:text-ink border-transparent'
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

      {/* Folder Chips with + New Folder Button */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedFolderId(null)}
          style={
            selectedFolderId === null
              ? { background: 'linear-gradient(135deg, #683CB8 0%, #1B6CB5 100%)', color: '#FFFFFF' }
              : {}
          }
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap',
            selectedFolderId === null
              ? 'border-white/20 shadow-xs'
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
              style={
                isSelected
                  ? { background: 'linear-gradient(135deg, #683CB8 0%, #1B6CB5 100%)', color: '#FFFFFF' }
                  : {}
              }
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 whitespace-nowrap',
                isSelected
                  ? 'border-white/20 shadow-xs'
                  : 'bg-surface text-ink-muted hover:text-ink border-glass-border hover:bg-surface-elevated'
              )}
            >
              <FolderIconRenderer icon={folder.icon} size={14} className="flex-shrink-0" />
              <span>{folder.name}</span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => setIsFolderModalOpen(true)}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-dashed border-lavender-accent/40 text-lavender-accent hover:bg-lavender-accent/15 flex items-center gap-1 whitespace-nowrap"
          title="Create New Folder"
        >
          <PlusIcon size={13} />
          <span>Folder</span>
        </button>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-lavender-accent uppercase tracking-wider">
            <PinIcon size={14} className="fill-current" />
            <span>Pinned ({pinnedNotes.length})</span>
          </div>

          <div
            className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {pinnedNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* All Notes Section */}
      <div className="flex flex-col gap-3">
        {pinnedNotes.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider">
            <NotesIcon size={14} />
            <span>Other Notes ({otherNotes.length})</span>
          </div>
        )}

        {otherNotes.length === 0 && pinnedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-surface/50 border border-glass-border">
            <div className="w-12 h-12 rounded-2xl bg-lavender-accent/10 flex items-center justify-center text-lavender-accent mb-3 shadow-xs">
              <NotesIcon size={24} />
            </div>
            <h3 className="text-sm font-bold text-ink">No notes found</h3>
            <p className="text-xs text-ink-muted mt-1 max-w-xs">
              {searchQuery || selectedFolderId || selectedTagId || creatorFilter !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Capture your thoughts, ideas, lists, and stories together.'}
            </p>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {otherNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>

      {/* Full Modal Rich-Text Note Editor */}
      <NoteEditor />

      {/* New Folder Modal */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreated={(id) => setSelectedFolderId(id)}
      />
    </div>
  )
}
