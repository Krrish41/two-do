import React from 'react'
import { motion } from 'framer-motion'
import { Pin, Trash2, RotateCcw } from 'lucide-react'
import type { Note } from '../../lib/database.types'
import { useNoteStore, NOTE_COLOR_PRESETS } from '../../stores/noteStore'
import { useThemeStore } from '../../stores/themeStore'
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
  const isDark = useThemeStore((s) => s.isDark)

  const folder = folders.find((f) => f.id === note.folder_id)
  const attachedTags = noteTags
    .filter((nt) => nt.note_id === note.id)
    .map((nt) => tags.find((t) => t.id === nt.tag_id))
    .filter(Boolean)

  // Determine card background color
  const preset = NOTE_COLOR_PRESETS.find((p) => p.hex === note.color)
  const bgColor = isDark
    ? preset?.darkBg || 'rgba(255,255,255,0.07)'
    : note.color || '#F4F2EF'

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
      <motion.div
        layout
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={() => !isRecycleBin && setSelectedNoteId(note.id)}
        style={{ backgroundColor: bgColor }}
        className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-glass-border shadow-sm cursor-pointer select-none transition-shadow hover:shadow-md gap-4"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {note.is_pinned && (
            <Pin className="w-3.5 h-3.5 fill-current text-lavender-accent flex-shrink-0" />
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-ink truncate tracking-tight">
                {note.title || 'Untitled'}
              </h4>
              {folder && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface border border-glass-border-subtle flex-shrink-0">
                  <span>{folder.icon || '📁'}</span>
                  <span>{folder.name}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-ink-muted truncate mt-0.5">
              {textPreview || <span className="italic opacity-60">Empty note...</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            {attachedTags.slice(0, 3).map((tag) => (
              <span
                key={tag?.id}
                className="text-[10px] font-medium text-ink-muted bg-surface px-2 py-0.5 rounded-full border border-glass-border-subtle"
              >
                #{tag?.name}
              </span>
            ))}
          </div>

          <span className="text-[11px] text-ink-subtle">{formatDate(note.updated_at || note.created_at)}</span>

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
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm('Permanently delete this note? This cannot be undone.')) {
                    deleteForeverNote(note.id)
                  }
                }}
                className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
                title="Delete forever"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // Grid / Masonry View Rendering
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={() => !isRecycleBin && setSelectedNoteId(note.id)}
      style={{ backgroundColor: bgColor }}
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
              <Pin className={cn('w-3.5 h-3.5', note.is_pinned && 'fill-current')} />
            </button>
          )}
        </div>

        {/* Content Snippet */}
        <p className="text-xs sm:text-sm text-ink-muted line-clamp-4 leading-relaxed whitespace-pre-wrap font-normal">
          {textPreview || <span className="italic opacity-60">Empty note...</span>}
        </p>
      </div>

      {/* Footer: Tags, Folder, Date */}
      <div className="mt-4 pt-3 border-t border-glass-border-subtle flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {folder && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-surface border border-glass-border-subtle">
              <span>{folder.icon || '📁'}</span>
              <span>{folder.name}</span>
            </span>
          )}

          {attachedTags.slice(0, 3).map((tag) => (
            <span
              key={tag?.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface text-ink-muted border border-glass-border-subtle"
            >
              #{tag?.name}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-ink-subtle ml-auto">
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
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm('Permanently delete this note?')) {
                    deleteForeverNote(note.id)
                  }
                }}
                className="p-1 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25"
                title="Delete forever"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
