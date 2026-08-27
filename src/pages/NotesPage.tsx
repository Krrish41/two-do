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
import { GlassModal } from '../components/glass/GlassModal'
import { CoupleAvatar } from '../components/common/CoupleAvatar'
import { useNoteStore } from '../stores/noteStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'

export const NotesPage: React.FC = () => {
  const notes = useNoteStore((s) => s.notes)
  const folders = useNoteStore((s) => s.folders)
  const createFolder = useNoteStore((s) => s.createFolder)
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
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderIcon, setNewFolderIcon] = useState('📁')

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

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    const newFolder = await createFolder(newFolderName.trim(), newFolderIcon)
    if (newFolder?.id) {
      setSelectedFolderId(newFolder.id)
    }
    setNewFolderName('')
    setNewFolderIcon('📁')
    setIsFolderModalOpen(false)
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
              <span>{folder.icon || '📁'}</span>
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

      {/* New Folder Modal */}
      <GlassModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="Create New Folder"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-2 rounded-xl bg-surface border border-glass-border">
              {['📁', '💼', '🏡', '✈️', '🎨', '💡', '📚', '🎯'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewFolderIcon(emoji)}
                  className={cn(
                    'p-1.5 rounded-lg text-lg transition-transform',
                    newFolderIcon === emoji ? 'bg-lavender-accent/20 scale-110' : 'hover:bg-surface'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <GlassInput
            placeholder="Folder name (e.g. Vacation, Finance)..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFolderModalOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={!newFolderName.trim()}
            >
              Create Folder
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  )
}
