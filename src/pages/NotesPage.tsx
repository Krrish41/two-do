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
import { GlassInput } from '../components/glass/GlassInput'
import { GlassButton } from '../components/glass/GlassButton'
import { motion } from 'framer-motion'
import { CreatorFilterTabs } from '../components/common/CreatorFilterTabs'
import { FolderIconRenderer } from '../components/common/FolderIconRenderer'
import { CreateFolderModal } from '../components/common/CreateFolderModal'
import { TagPillBar } from '../components/notes/TagPillBar'
import { useNoteStore } from '../stores/noteStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'
import { CollapsingHeader } from '../components/layout/CollapsingHeader'

export const NotesPage: React.FC = () => {
  const notes = useNoteStore((s) => s.notes)
  const folders = useNoteStore((s) => s.folders)
  const noteTags = useNoteStore((s) => s.noteTags)
  const selectedTagIds = useNoteStore((s) => s.selectedTagIds)
  const addNote = useNoteStore((s) => s.addNote)
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId)
  const fetchNotes = useNoteStore((s) => s.fetchNotes)

  // Ensure notes are freshly fetched upon opening NotesPage
  React.useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)

  const [searchQuery, setSearchQuery] = useState('')
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

      if (selectedTagIds.length > 0) {
        const thisNoteTagIds = noteTags.filter((nt) => nt.note_id === n.id).map((nt) => nt.tag_id)
        const matchesTag = selectedTagIds.some((id) => thisNoteTagIds.includes(id))
        if (!matchesTag) return false
      }

      if (creatorFilter === 'mine' && n.created_by !== authorizedUser?.id) return false
      if (creatorFilter === 'partner' && n.created_by !== partnerUser?.id) return false

      return true
    })
  }, [notes, searchQuery, selectedFolderId, selectedTagIds, creatorFilter, authorizedUser, partnerUser, noteTags])

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.is_pinned), [filteredNotes])
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.is_pinned), [filteredNotes])

  const handleCreateNote = async () => {
    const newNote = await addNote({
      title: '',
      folder_id: selectedFolderId,
    })
    if (newNote) {
      setSelectedNoteId(newNote.id)
    }
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto pb-32 sm:pb-16">
      {/* Mobile Collapsing Large-Title Header (<768px) */}
      <CollapsingHeader title="Notes" />

      {/* Main Page Content */}
      <div className="flex flex-col gap-2.5 sm:gap-4 px-3.5 sm:px-0 pt-1 sm:pt-0">
        {/* Header & Main Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-skyblue-accent font-bold text-xs uppercase tracking-wider mb-1">
              <NotesIcon size={16} />
              <span>Shared Workspace</span>
            </div>
            <h1 className="hidden md:block text-xl sm:text-3xl font-extrabold text-ink tracking-tight">Notes</h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Rich-text documents, meeting notes, recipes, and ideas.
            </p>
          </div>

          {/* Search bar + View Mode Toggle (desktop only) + New Note Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-64">
              <GlassInput
                type="text"
                placeholder="Search notes or #tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<SearchIcon size={15} />}
              />
            </div>

            {/* View Mode Toggle - only visible on md+ (hidden on phone) */}
            <div className="hidden md:flex relative items-center p-1 rounded-[18px] bg-slate-200/75 dark:bg-white/[0.05] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'relative p-2 rounded-[14px] transition-colors focus:outline-none cursor-pointer',
                  viewMode === 'grid' ? 'text-ink font-bold' : 'text-ink-muted hover:text-ink'
                )}
                title="Grid View"
              >
                {viewMode === 'grid' && (
                  <motion.div
                    layoutId="notes-viewmode-bubble"
                    className="absolute inset-0 rounded-[14px] bg-white dark:bg-white/[0.14] backdrop-blur-md border border-white/80 dark:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <GridIcon size={16} className="relative z-10" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'relative p-2 rounded-[14px] transition-colors focus:outline-none cursor-pointer',
                  viewMode === 'list' ? 'text-ink font-bold' : 'text-ink-muted hover:text-ink'
                )}
                title="List View"
              >
                {viewMode === 'list' && (
                  <motion.div
                    layoutId="notes-viewmode-bubble"
                    className="absolute inset-0 rounded-[14px] bg-white dark:bg-white/[0.14] backdrop-blur-md border border-white/80 dark:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <ListIcon size={16} className="relative z-10" />
              </button>
            </div>

            {/* New Note Button */}
            <GlassButton
              variant="primary"
              size="md"
              onClick={handleCreateNote}
              className="flex items-center gap-1.5 flex-shrink-0 px-3.5 h-[42px]"
            >
              <PlusIcon size={17} />
              <span className="text-xs sm:text-sm font-semibold">New Note</span>
            </GlassButton>
          </div>
        </div>

        {/* Creator Tabs Filter (Full-width) */}
        <CreatorFilterTabs
          value={creatorFilter}
          onChange={setCreatorFilter}
          allLabel="All Notes"
          fullWidth
          className="w-full"
          layoutId="notes-creator-tabs"
        />

        {/* Unified Folders & Tags Filter Bar */}
        <TagPillBar
          wrap
          prefixChildren={
            <>
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className={cn(
                  'flex-shrink-0 h-7 px-3 rounded-full text-xs font-semibold transition-all border whitespace-nowrap cursor-pointer flex items-center justify-center',
                  selectedFolderId === null
                    ? 'bg-lavender-accent/25 text-lavender-accent dark:text-[#E4DBF7] border-lavender-accent/40 shadow-xs'
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
                      'flex-shrink-0 h-7 px-3 rounded-full text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer',
                      isSelected
                        ? 'bg-lavender-accent/25 text-lavender-accent dark:text-[#E4DBF7] border-lavender-accent/40 shadow-xs'
                        : 'bg-surface text-ink-muted hover:text-ink border-glass-border hover:bg-surface-elevated'
                    )}
                  >
                    <FolderIconRenderer icon={folder.icon} size={13} className="flex-shrink-0" />
                    <span>{folder.name}</span>
                  </button>
                )
              })}

              <button
                type="button"
                onClick={() => setIsFolderModalOpen(true)}
                className="flex-shrink-0 h-7 px-2.5 rounded-full text-xs font-semibold transition-all border border-dashed border-lavender-accent/40 text-lavender-accent hover:bg-lavender-accent/15 flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title="Create New Folder"
              >
                <PlusIcon size={12} />
                <span>Folder</span>
              </button>
            </>
          }
        />

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
              {searchQuery || selectedFolderId || selectedTagIds.length > 0 || creatorFilter !== 'all'
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

      {/* New Folder Modal */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreated={(id) => setSelectedFolderId(id)}
      />
      </div>
    </div>
  )
}
