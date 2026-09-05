import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Quote,
  Code,
  Undo,
  Redo,
} from 'lucide-react'
import {
  PinIcon,
  TrashIcon,
  FolderIcon,
  PlusIcon,
} from '../icons'
import { GlassDropdown } from '../glass/GlassDropdown'
import { GlassConfirmDialog } from '../glass/GlassConfirmDialog'
import { ColorSwatchPicker } from './ColorSwatchPicker'
import { TagPicker } from './TagPicker'
import { CoupleAvatar } from '../common/CoupleAvatar'
import { FolderIconRenderer } from '../common/FolderIconRenderer'
import { CreateFolderModal } from '../common/CreateFolderModal'
import { useNoteStore, NOTE_COLOR_PRESETS } from '../../stores/noteStore'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { cn } from '../../lib/utils'
import type { Note } from '../../lib/database.types'

interface NoteEditorModalContentProps {
  note: Note
  onClose: () => void
}

const NoteEditorModalContent: React.FC<NoteEditorModalContentProps> = ({ note, onClose }) => {
  const updateNote = useNoteStore((s) => s.updateNote)
  const softDeleteNote = useNoteStore((s) => s.softDeleteNote)
  const togglePin = useNoteStore((s) => s.togglePin)
  const extractAndSyncTags = useNoteStore((s) => s.extractAndSyncTags)
  const folders = useNoteStore((s) => s.folders)
  const allUsers = useAuthStore((s) => s.allUsers)
  const isDark = useThemeStore((s) => s.isDark)

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')

  // Local state for Title & Color for instant 0ms feedback
  const [localTitle, setLocalTitle] = useState(note.title || '')
  const [localColor, setLocalColor] = useState(note.color || '#FAF8F5')

  // Refs for tracking changes and debounced persistence
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const contentTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const titleInputRef = useRef<HTMLTextAreaElement | null>(null)
  const latestTitleRef = useRef(localTitle)
  const latestContentRef = useRef<any>(note.content)
  const requestSeqRef = useRef(0)

  latestTitleRef.current = localTitle

  // Auto-resize note title textarea
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.style.height = 'auto'
      titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`
    }
  }, [localTitle, note.id])

  const creatorUser = allUsers.find((u) => u.id === note.created_by)

  // Debounced content save function (400ms)
  const debouncedSaveContent = useCallback(
    (json: any, text: string) => {
      latestContentRef.current = json
      setSaveStatus('saving')
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current)
      }
      const seq = ++requestSeqRef.current
      contentTimeoutRef.current = setTimeout(async () => {
        await updateNote(note.id, { content: json })
        await extractAndSyncTags(note.id, `${latestTitleRef.current} ${text}`)
        if (seq === requestSeqRef.current) {
          setSaveStatus('saved')
        }
      }, 400)
    },
    [note.id, updateNote, extractAndSyncTags]
  )

  // Debounced title save function (400ms)
  const debouncedSaveTitle = useCallback(
    (newTitle: string, editorText: string) => {
      setSaveStatus('saving')
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
      const seq = ++requestSeqRef.current
      titleTimeoutRef.current = setTimeout(async () => {
        await updateNote(note.id, { title: newTitle })
        await extractAndSyncTags(note.id, `${newTitle} ${editorText}`)
        if (seq === requestSeqRef.current) {
          setSaveStatus('saved')
        }
      }, 400)
    },
    [note.id, updateNote, extractAndSyncTags]
  )

  const handleColorChange = (newHex: string) => {
    setLocalColor(newHex)
    updateNote(note.id, { color: newHex })
  }

  // Flush any pending save immediately
  const flushSave = useCallback(() => {
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current)
      titleTimeoutRef.current = null
    }
    if (contentTimeoutRef.current) {
      clearTimeout(contentTimeoutRef.current)
      contentTimeoutRef.current = null
    }
    updateNote(note.id, {
      title: latestTitleRef.current,
      content: latestContentRef.current,
    })
    setSaveStatus('saved')
  }, [note.id, updateNote])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'Write thoughts, meeting notes, lists, or plans (use #tags)...',
      }),
    ],
    content: (note.content as any) || '',
    onUpdate: ({ editor: ed }) => {
      debouncedSaveContent(ed.getJSON(), ed.getText())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[300px] text-ink font-normal leading-relaxed',
      },
    },
  })

  // Clean up and flush save on unmount
  useEffect(() => {
    return () => {
      flushSave()
    }
  }, [flushSave])

  const handleCloseModal = () => {
    flushSave()
    onClose()
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const preset =
    NOTE_COLOR_PRESETS.find((p) => p.hex.toLowerCase() === localColor.toLowerCase()) ||
    NOTE_COLOR_PRESETS[0]
  const isClear = preset.id === 'clear' || localColor?.startsWith('rgba') || !localColor || localColor === '#FAF8F5'

  const bgColor = isDark
    ? isClear
      ? 'rgba(22, 16, 36, 0.80)'
      : preset.darkBg
    : isClear
    ? 'rgba(255, 255, 255, 0.68)'
    : localColor
  const borderColor = isDark
    ? isClear
      ? 'rgba(255, 255, 255, 0.16)'
      : preset.darkBorder
    : isClear
    ? 'rgba(255, 255, 255, 0.90)'
    : 'rgba(0, 0, 0, 0.12)'
  const modalShadow = isDark
    ? '0 24px 72px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.2)'
    : isClear
    ? '0 24px 60px rgba(104,60,184,0.18), 0 4px 20px rgba(0,0,0,0.06), inset 0 1.5px 1.5px rgba(255,255,255,0.95)'
    : '0 24px 60px rgba(104,60,184,0.15), 0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)'

  // Exclude system folders (Bucket List) so it is not repeated in dropdowns
  const assignableFolders = folders.filter((f) => !f.is_system && f.slug !== 'bucket-list')
  const folderDropdownOptions = [
    { value: '', label: 'No Folder', icon: <FolderIcon size={14} className="text-ink-muted" /> },
    ...assignableFolders.map((f) => ({
      value: f.id,
      label: f.name,
      icon: <FolderIconRenderer icon={f.icon} size={14} className="flex-shrink-0" />,
    })),
  ]

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          key="note-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-ink/40 backdrop-blur-md"
          onClick={handleCloseModal}
        />

        {/* Modal Container: Fullscreen on mobile, centered card on desktop */}
        <motion.div
          key="note-modal-card"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full h-[100dvh] sm:h-[88vh] sm:max-h-[850px] sm:max-w-3xl rounded-none sm:rounded-[32px] flex flex-col overflow-hidden z-10 border-0 sm:border backdrop-blur-2xl transition-colors duration-200"
          style={{ backgroundColor: bgColor, borderColor, boxShadow: modalShadow }}
        >
          {/* HEADER TOOLBAR (Safe area top padding to clear Dynamic Island / notch) */}
          <div
            style={{
              paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)',
            }}
            className="relative z-30 flex-shrink-0 px-4 sm:px-6 pb-2.5 sm:py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between gap-2 sm:gap-3 bg-black/[0.02] dark:bg-white/[0.03] backdrop-blur-md"
          >
            {/* Left Controls: Done, Folder, Save Status */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-surface/90 text-ink hover:bg-surface-elevated transition-all border border-glass-border shadow-xs cursor-pointer flex-shrink-0"
              >
                Done
              </button>

              <div className="w-36 sm:w-44 min-w-0">
                <GlassDropdown
                  options={folderDropdownOptions}
                  value={note.folder_id || ''}
                  onChange={(folderId) => updateNote(note.id, { folder_id: folderId || null })}
                  placeholder="Folder"
                  actionItem={{
                    label: 'New Folder',
                    icon: <PlusIcon size={14} />,
                    onClick: () => setIsFolderModalOpen(true),
                  }}
                />
              </div>

              {/* Real-time Debounced Save Status Indicator */}
              <div
                className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-surface-elevated/70 dark:bg-white/[0.06] border border-glass-border text-[10px] font-semibold text-ink-muted flex-shrink-0"
                title={saveStatus === 'saving' ? 'Saving changes...' : 'All changes saved'}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    saveStatus === 'saving'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-500'
                  )}
                />
                <span className="capitalize hidden sm:inline">{saveStatus}</span>
              </div>
            </div>

            {/* Right Controls: Creator Tag, Pin, Delete */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {creatorUser && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated/60 dark:bg-white/[0.06] border border-glass-border text-xs text-ink-muted">
                  <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={14} />
                  <span className="font-semibold text-[11px]">Added by {creatorUser.display_name}</span>
                </div>
              )}

              {/* Pin Toggle */}
              <button
                type="button"
                onClick={() => togglePin(note.id)}
                className={cn(
                  'p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer',
                  note.is_pinned
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title={note.is_pinned ? 'Unpin Note' : 'Pin Note'}
              >
                <PinIcon size={16} />
              </button>

              {/* Move to Recycle Bin */}
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-1.5 sm:p-2 rounded-xl text-ink-muted hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                title="Move to Recycle Bin"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>

          {/* SCROLLABLE EDITOR CONTENT (Unified Apple Notes single canvas) */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-12 py-5 sm:py-8 flex flex-col gap-4 sm:gap-5">
            {/* Note Title Input (Auto-resizing, clean without harsh border) */}
            <textarea
              ref={titleInputRef}
              data-note-id={note.id}
              value={localTitle}
              rows={1}
              onChange={(e) => {
                const newTitle = e.target.value
                setLocalTitle(newTitle)
                if (titleInputRef.current) {
                  titleInputRef.current.style.height = 'auto'
                  titleInputRef.current.style.height = `${titleInputRef.current.scrollHeight}px`
                }
                debouncedSaveTitle(newTitle, editor?.getText() || '')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  editor?.commands.focus('start')
                }
              }}
              placeholder="Note Title..."
              className="w-full bg-transparent font-extrabold text-2xl sm:text-3xl text-ink tracking-tight outline-none placeholder:text-ink-muted/40 resize-none leading-snug break-words"
            />

            {/* Customization Bar: Color Swatches & Tags inside document flow */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-1">
              <div className="flex items-center gap-2">
                <ColorSwatchPicker
                  selectedColor={localColor}
                  onSelectColor={handleColorChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <TagPicker noteId={note.id} />
              </div>
            </div>

            {/* Tiptap Rich Text Content Canvas */}
            <div className="flex-1 min-h-[350px] cursor-text pb-28 pt-1" onClick={() => editor?.commands.focus()}>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* DOCKED FLOATING FORMATTING TOOLBAR (Unified Apple Notes Accessory Bar - Zero Cutoff) */}
          <div
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)' }}
            className="flex-shrink-0 px-2 py-2 sm:py-2.5 bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-xl border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center"
          >
            <div className="flex items-center justify-center w-full max-w-2xl px-1.5 sm:px-3 py-1 rounded-2xl bg-surface/90 dark:bg-white/[0.06] border border-glass-border shadow-xs gap-0.5 sm:gap-1.5 overflow-x-auto scrollbar-none">
              {/* Text Marks: Bold, Italic, Strike, Highlight */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('bold')
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Bold"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('italic')
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Italic"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('strike')
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Strikethrough"
              >
                <Strikethrough size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHighlight().run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('highlight')
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Highlight"
              >
                <Highlighter size={13} />
              </button>

              {/* Divider */}
              <div className="h-3.5 w-[1px] bg-glass-border-subtle mx-0.5 flex-shrink-0" />

              {/* Headings */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('heading', { level: 1 })
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Heading 1"
              >
                <Heading1 size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('heading', { level: 2 })
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Heading 2"
              >
                <Heading2 size={13} />
              </button>

              {/* Divider */}
              <div className="h-3.5 w-[1px] bg-glass-border-subtle mx-0.5 flex-shrink-0" />

              {/* Lists: Bullet & Checklist */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('bulletList')
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Bullet List"
              >
                <List size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('taskList')
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Checklist"
              >
                <CheckSquare size={13} />
              </button>

              {/* Divider */}
              <div className="h-3.5 w-[1px] bg-glass-border-subtle mx-0.5 flex-shrink-0" />

              {/* Quote & Code */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('blockquote')
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Quote"
              >
                <Quote size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={cn(
                  'w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0',
                  editor?.isActive('codeBlock')
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Code"
              >
                <Code size={13} />
              </button>

              {/* Divider */}
              <div className="h-3.5 w-[1px] bg-glass-border-subtle mx-0.5 flex-shrink-0" />

              {/* History: Undo, Redo */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                className="w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex-shrink-0"
                title="Undo"
              >
                <Undo size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                className="w-[25px] h-[26px] sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex-shrink-0"
                title="Redo"
              >
                <Redo size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modern Glass Confirm Dialog for Note Deletion */}
      <GlassConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Move Note to Bin?"
        description="Are you sure you want to move this note to the Recycle Bin? You can restore it anytime."
        confirmText="Move to Bin"
        variant="danger"
        onConfirm={() => {
          setIsDeleteConfirmOpen(false)
          softDeleteNote(note.id)
          onClose()
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
    </>
  )
}

export const NoteEditor: React.FC = () => {
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId)
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId)
  const notes = useNoteStore((s) => s.notes)

  const currentNote = notes.find((n) => n.id === selectedNoteId && n.deleted_at === null)

  return (
    <AnimatePresence>
      {selectedNoteId && currentNote && (
        <NoteEditorModalContent
          key={currentNote.id}
          note={currentNote}
          onClose={() => setSelectedNoteId(null)}
        />
      )}
    </AnimatePresence>
  )
}
