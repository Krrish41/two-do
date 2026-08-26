import React from 'react'
import { motion } from 'framer-motion'
import { Pin, Folder as FolderIcon } from 'lucide-react'
import type { Note } from '../../lib/database.types'
import { useNoteStore } from '../../stores/noteStore'
import { useAuthStore } from '../../stores/authStore'
import { cn, formatDate } from '../../lib/utils'

export interface NoteCardProps {
  note: Note
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId)
  const togglePin = useNoteStore((s) => s.togglePin)
  const folders = useNoteStore((s) => s.folders)
  const tags = useNoteStore((s) => s.tags)
  const noteTags = useNoteStore((s) => s.noteTags)
  const allUsers = useAuthStore((s) => s.allUsers)

  const folder = folders.find((f) => f.id === note.folder_id)
  const attachedTags = noteTags
    .filter((nt) => nt.note_id === note.id)
    .map((nt) => tags.find((t) => t.id === nt.tag_id))
    .filter(Boolean)

  const author = allUsers.find((u) => u.id === note.created_by)

  // Extract a clean text preview from Tiptap JSON content
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

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={() => setSelectedNoteId(note.id)}
      style={{ backgroundColor: note.color || '#F4F2EF' }}
      className="group relative flex flex-col justify-between p-5 rounded-3xl border border-white/60 shadow-glass cursor-pointer transition-shadow hover:shadow-xl min-h-[160px] select-none"
    >
      <div>
        {/* Header: Pin & Folder */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <h4 className="font-bold text-base text-ink line-clamp-1 flex-1 tracking-tight">
            {note.title || 'Untitled'}
          </h4>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              togglePin(note.id)
            }}
            className={cn(
              'p-1.5 rounded-full transition-all duration-200',
              note.is_pinned
                ? 'bg-ink/10 text-ink scale-110'
                : 'text-ink/30 hover:text-ink hover:bg-black/5 opacity-0 group-hover:opacity-100'
            )}
            title={note.is_pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={cn('w-3.5 h-3.5', note.is_pinned && 'fill-current')} />
          </button>
        </div>

        {/* Content Snippet */}
        <p className="text-xs sm:text-sm text-ink/70 line-clamp-4 leading-relaxed whitespace-pre-wrap font-normal">
          {textPreview || <span className="italic text-ink/40">Empty note...</span>}
        </p>
      </div>

      {/* Footer: Tags, Folder, Author, Date */}
      <div className="mt-4 pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {folder && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/60 text-ink/70 border border-black/5">
              <FolderIcon className="w-2.5 h-2.5" />
              {folder.name}
            </span>
          )}

          {attachedTags.map((tag) => (
            <span
              key={tag?.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/70 text-ink/80 border border-black/5 shadow-2xs"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: tag?.color || '#A7C7E7' }}
              />
              {tag?.name}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-ink/50 ml-auto">
          {author && (
            <span
              className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
              style={{ backgroundColor: author.accent_color || '#B8A9E8' }}
              title={`Created by ${author.display_name}`}
            >
              {author.display_name.charAt(0).toUpperCase()}
            </span>
          )}
          <span>{formatDate(note.updated_at || note.created_at)}</span>
        </div>
      </div>
    </motion.div>
  )
}
