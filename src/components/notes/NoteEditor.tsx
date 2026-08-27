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
  ListOrdered,
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
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const latestTitleRef = useRef(localTitle)
  const latestContentRef = useRef<any>(note.content)
  const requestSeqRef = useRef(0)

  latestTitleRef.current = localTitle

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
  const bgColor = isDark
    ? preset.darkBg
    : localColor === 'rgba(255,255,255,0.4)'
    ? '#FAF8F5'
    : localColor
  const borderColor = isDark ? preset.darkBorder : 'rgba(0,0,0,0.12)'
  const modalShadow = isDark
    ? '0 24px 72px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.2)'
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

        {/* Modal Container */}
        <motion.div
          key="note-modal-card"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-3xl h-[100dvh] sm:h-[88vh] sm:max-h-[850px] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden z-10 border transition-colors duration-200"
          style={{ backgroundColor: bgColor, borderColor, boxShadow: modalShadow }}
        >
          {/* HEADER TOOLBAR (Elevated z-30 for pristine dropdown layering) */}
          <div className="relative z-30 flex-shrink-0 px-6 py-4 border-b border-glass-border-subtle flex items-center justify-between gap-3 bg-surface/75 dark:bg-black/35 backdrop-blur-xl">
            {/* Left Controls: Done, Folder, Save Status */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-surface text-ink hover:bg-surface-elevated transition-all border border-glass-border shadow-xs cursor-pointer"
              >
                Done
              </button>

              <div className="w-36 sm:w-44">
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated/70 dark:bg-white/[0.06] border border-glass-border text-[11px] font-semibold text-ink-muted">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    saveStatus === 'saving'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-500'
                  )}
                />
                <span className="capitalize">{saveStatus}</span>
              </div>
            </div>

            {/* Right Controls: Creator Tag, Pin, Delete */}
            <div className="flex items-center gap-2">
              {creatorUser && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated/60 dark:bg-white/[0.06] border border-glass-border text-xs text-ink-muted">
                  <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={14} />
                  <span className="font-semibold text-[11px]">Added by {creatorUser.display_name}</span>
                </div>
              )}

              {/* Pin Toggle */}
              <button
                type="button"
                onClick={() => togglePin(note.id)}
                className={cn(
                  'p-2 rounded-xl transition-all cursor-pointer',
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
                className="p-2 rounded-xl text-ink-muted hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                title="Move to Recycle Bin"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>

          {/* SCROLLABLE EDITOR CONTENT (Unified Apple Notes single canvas) */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-6 sm:py-8 flex flex-col gap-6">
            {/* Note Title Input */}
            <input
              ref={titleInputRef}
              type="text"
              data-note-id={note.id}
              value={localTitle}
              onChange={(e) => {
                const newTitle = e.target.value
                setLocalTitle(newTitle)
                debouncedSaveTitle(newTitle, editor?.getText() || '')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  editor?.commands.focus('start')
                }
              }}
              placeholder="Note Title..."
              className="w-full bg-transparent font-extrabold text-2xl sm:text-3xl text-ink tracking-tight outline-none placeholder:text-ink-muted/50 border-b border-glass-border-subtle pb-3"
            />

            {/* Customization Bar: Color Swatches & Tags inside document flow */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-glass-border-subtle/60">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Tint:</span>
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
            <div className="flex-1 min-h-[350px] cursor-text pb-20" onClick={() => editor?.commands.focus()}>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* DOCKED FLOATING FORMATTING TOOLBAR (Segmented Cluster Pills) */}
          <div className="flex-shrink-0 p-3 sm:p-4 bg-surface/85 dark:bg-black/50 backdrop-blur-xl border-t border-glass-border-subtle flex items-center justify-center">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
              {/* Cluster 1: Text Marks (Bold, Italic, Strike, Highlight) */}
              <div className="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-glass-border-subtle/70">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('bold')
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Bold"
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('italic')
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Italic"
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('strike')
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Strikethrough"
                >
                  <Strikethrough size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHighlight().run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('highlight')
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Highlight"
                >
                  <Highlighter size={15} />
                </button>
              </div>

              {/* Cluster 2: Headings (H1, H2) */}
              <div className="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-glass-border-subtle/70">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('heading', { level: 1 })
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Heading 1"
                >
                  <Heading1 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('heading', { level: 2 })
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Heading 2"
                >
                  <Heading2 size={15} />
                </button>
              </div>

              {/* Cluster 3: Lists (Bullet, Numbered, Checklist) */}
              <div className="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-glass-border-subtle/70">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('bulletList')
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Bullet List"
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('orderedList')
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Numbered List"
                >
                  <ListOrdered size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleTaskList().run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('taskList')
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Checklist"
                >
                  <CheckSquare size={15} />
                </button>
              </div>

              {/* Cluster 4: Blocks (Quote, Code) */}
              <div className="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-glass-border-subtle/70">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('blockquote')
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Blockquote"
                >
                  <Quote size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                  className={cn(
                    'p-1.5 rounded-lg transition-all cursor-pointer',
                    editor?.isActive('codeBlock')
                      ? 'bg-lavender-accent text-white shadow-xs font-bold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                  )}
                  title="Code Block"
                >
                  <Code size={15} />
                </button>
              </div>

              {/* Cluster 5: History (Undo, Redo) */}
              <div className="flex items-center p-0.5 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-glass-border-subtle/70">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().undo()}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Undo"
                >
                  <Undo size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().redo()}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-elevated disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Redo"
                >
                  <Redo size={15} />
                </button>
              </div>
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
