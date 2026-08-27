import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PinIcon, TrashIcon, RestoreIcon } from '../icons'
import type { Note } from '../../lib/database.types'
import { useNoteStore, NOTE_COLOR_PRESETS } from '../../stores/noteStore'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { GlassConfirmDialog } from '../glass/GlassConfirmDialog'
import { CoupleAvatar } from '../common/CoupleAvatar'
import { FolderIconRenderer } from '../common/FolderIconRenderer'
import { cn, formatDate } from '../../lib/utils'

export interface NoteCardProps {
  note: Note
  isRecycleBin?: boolean
  viewMode?: 'grid' | 'list'
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isRecycleBin = false,
  viewMode = 'grid',
}) => {
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId)
  const togglePin = useNoteStore((s) => s.togglePin)
  const softDeleteNote = useNoteStore((s) => s.softDeleteNote)
  const restoreNote = useNoteStore((s) => s.restoreNote)
  const deleteForeverNote = useNoteStore((s) => s.deleteForeverNote)
  const folders = useNoteStore((s) => s.folders)
  const tags = useNoteStore((s) => s.tags)
  const noteTags = useNoteStore((s) => s.noteTags)
  const allUsers = useAuthStore((s) => s.allUsers)
  const isDark = useThemeStore((s) => s.isDark)

  const [isDeleteForeverOpen, setIsDeleteForeverOpen] = useState(false)

  const folder = folders.find((f) => f.id === note.folder_id)
  const creatorUser = allUsers.find((u) => u.id === note.created_by)
  const attachedTags = noteTags
    .filter((nt) => nt.note_id === note.id)
    .map((nt) => tags.find((t) => t.id === nt.tag_id))
    .filter(Boolean)

  const preset =
    NOTE_COLOR_PRESETS.find((p) => p.hex.toLowerCase() === note.color?.toLowerCase()) ||
    NOTE_COLOR_PRESETS[0]
  const bgColor = isDark ? preset.darkBg : note.color || '#F4F2EF'
  const borderColor = isDark ? preset.darkBorder : undefined

  const extractTextPreview = (content: any): string => {
    if (!content) return ''
    if (typeof content === 'string') return content
    try {
      const texts: string[] = []
      const walk = (node: any) => {
        if (node.text) texts.push(node.text)
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach(walk)
        }
      }
      walk(content)
      return texts.join(' ')
    } catch {
      return ''
    }
  }

  const textPreview = extractTextPreview(note.content)

  // List View Rendering
  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          layout
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          onClick={() => !isRecycleBin && setSelectedNoteId(note.id)}
          style={{ backgroundColor: bgColor, borderColor }}
          className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-glass-border shadow-sm cursor-pointer select-none transition-shadow hover:shadow-md gap-4"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {note.is_pinned && (
              <PinIcon size={14} className="fill-current text-lavender-accent flex-shrink-0" />
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-ink truncate tracking-tight">
                  {note.title || 'Untitled'}
                </h4>
                {folder && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface border border-glass-border flex-shrink-0">
                    <FolderIconRenderer icon={folder.icon} size={12} className="flex-shrink-0" />
                    <span>{folder.name}</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-ink-muted truncate mt-0.5 font-normal">
                {textPreview || <span className="italic opacity-60">Empty note...</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Read-Only Creator Mascot Attribution */}
            {creatorUser && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink bg-surface px-2.5 py-0.5 rounded-full border border-glass-border">
                <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={16} />
                <span>Added by {creatorUser.display_name}</span>
              </span>
            )}

            <div className="hidden sm:flex items-center gap-1">
              {attachedTags.slice(0, 2).map((tag) => (
                <span
                  key={tag?.id}
                  className="text-[10px] font-semibold text-ink-muted bg-surface px-2 py-0.5 rounded-full border border-glass-border"
                >
                  #{tag?.name}
                </span>
              ))}
            </div>

            <span className="text-[11px] text-ink-subtle font-medium">{formatDate(note.updated_at || note.created_at)}</span>

            {isRecycleBin ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    restoreNote(note.id)
                  }}
                  className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                  title="Restore note"
                >
                  <RestoreIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDeleteForeverOpen(true)
                  }}
                  className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
                  title="Delete forever"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  softDeleteNote(note.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-ink-muted hover:text-rose-500 transition-opacity"
                title="Move to Recycle Bin"
              >
                <TrashIcon size={14} />
              </button>
            )}
          </div>
        </motion.div>

        <GlassConfirmDialog
          isOpen={isDeleteForeverOpen}
          title="Delete Forever?"
          description="Are you sure you want to permanently delete this note? This action cannot be undone."
          confirmText="Delete Forever"
          variant="danger"
          onConfirm={() => {
            setIsDeleteForeverOpen(false)
            deleteForeverNote(note.id)
          }}
          onCancel={() => setIsDeleteForeverOpen(false)}
        />
      </>
    )
  }

  // Grid / Masonry View Rendering
  return (
    <>
      <motion.div
        layout
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={() => !isRecycleBin && setSelectedNoteId(note.id)}
        style={{ backgroundColor: bgColor, borderColor }}
        className="group relative flex flex-col justify-between p-5 rounded-3xl border border-glass-border shadow-glass cursor-pointer select-none transition-shadow hover:shadow-xl min-h-[170px]"
      >
        <div>
          {/* Header: Title & Pin/Delete */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <h4 className="font-bold text-base text-ink line-clamp-1 flex-1 tracking-tight">
              {note.title || 'Untitled'}
            </h4>

            {!isRecycleBin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  togglePin(note.id)
                }}
                className={cn(
                  'p-1.5 rounded-full transition-all duration-200',
                  note.is_pinned
                    ? 'bg-ink/10 text-lavender-accent scale-110'
                    : 'text-ink-muted hover:text-ink hover:bg-surface opacity-0 group-hover:opacity-100'
                )}
                title={note.is_pinned ? 'Unpin note' : 'Pin note'}
              >
                <PinIcon size={14} className={cn(note.is_pinned && 'fill-current')} />
              </button>
            )}
          </div>

          {/* Content Snippet */}
          <p className="text-xs sm:text-sm text-ink-muted line-clamp-4 leading-relaxed whitespace-pre-wrap font-normal">
            {textPreview || <span className="italic opacity-60">Empty note...</span>}
          </p>
        </div>

        {/* Footer: Tags, Folder, Creator, Date */}
        <div className="mt-4 pt-3 border-t border-glass-border-subtle flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {folder && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface border border-glass-border">
                <FolderIconRenderer icon={folder.icon} size={12} className="flex-shrink-0" />
                <span>{folder.name}</span>
              </span>
            )}

            {creatorUser && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-ink bg-surface px-2 py-0.5 rounded-full border border-glass-border">
                <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={14} />
                <span>Added by {creatorUser.display_name}</span>
              </span>
            )}

            {attachedTags.slice(0, 2).map((tag) => (
              <span
                key={tag?.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface text-ink-muted border border-glass-border"
              >
                #{tag?.name}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-ink-subtle ml-auto font-medium">
            <span>{formatDate(note.updated_at || note.created_at)}</span>

            {isRecycleBin && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    restoreNote(note.id)
                  }}
                  className="p-1 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25"
                  title="Restore note"
                >
                  <RestoreIcon size={12} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDeleteForeverOpen(true)
                  }}
                  className="p-1 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
                  title="Delete forever"
                >
                  <TrashIcon size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <GlassConfirmDialog
        isOpen={isDeleteForeverOpen}
        title="Delete Forever?"
        description="Are you sure you want to permanently delete this note? This action cannot be undone."
        confirmText="Delete Forever"
        variant="danger"
        onConfirm={() => {
          setIsDeleteForeverOpen(false)
          deleteForeverNote(note.id)
        }}
        onCancel={() => setIsDeleteForeverOpen(false)}
      />
    </>
  )
}
