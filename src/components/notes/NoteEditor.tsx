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

export const NoteEditor: React.FC = () => {
  const selectedNoteId = useNoteStore((s) => s.selectedNoteId)
  const setSelectedNoteId = useNoteStore((s) => s.setSelectedNoteId)
  const notes = useNoteStore((s) => s.notes)
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

  const currentNote = notes.find((n) => n.id === selectedNoteId)
  const creatorUser = allUsers.find((u) => u.id === currentNote?.created_by)

  // Local state for title to eliminate typing lag and cursor jumping
  const [localTitle, setLocalTitle] = useState(currentNote?.title || '')

  // Refs for tracking active note and debouncing saves
  const activeNoteIdRef = useRef<string | null>(selectedNoteId)
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const contentTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const latestTitleRef = useRef(localTitle)
  const latestContentRef = useRef<any>(currentNote?.content)
  const isInternalUpdateRef = useRef(false)
  const requestSeqRef = useRef(0)

  latestTitleRef.current = localTitle

  // Keep activeNoteIdRef updated
  useEffect(() => {
    activeNoteIdRef.current = selectedNoteId
  }, [selectedNoteId])

  // Debounced content save function (500ms)
  const debouncedSaveContent = useCallback(
    (noteId: string, json: any, text: string) => {
      latestContentRef.current = json
      setSaveStatus('saving')
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current)
      }
      const seq = ++requestSeqRef.current
      contentTimeoutRef.current = setTimeout(async () => {
        isInternalUpdateRef.current = true
        await updateNote(noteId, { content: json })
        await extractAndSyncTags(noteId, `${latestTitleRef.current} ${text}`)
        if (seq === requestSeqRef.current) {
          setSaveStatus('saved')
        }
        setTimeout(() => {
          isInternalUpdateRef.current = false
        }, 100)
      }, 500)
    },
    [updateNote, extractAndSyncTags]
  )

  // Debounced title save function (500ms)
  const debouncedSaveTitle = useCallback(
    (noteId: string, newTitle: string, editorText: string) => {
      setSaveStatus('saving')
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
      const seq = ++requestSeqRef.current
      titleTimeoutRef.current = setTimeout(async () => {
        isInternalUpdateRef.current = true
        await updateNote(noteId, { title: newTitle })
        await extractAndSyncTags(noteId, `${newTitle} ${editorText}`)
        if (seq === requestSeqRef.current) {
          setSaveStatus('saved')
        }
        setTimeout(() => {
          isInternalUpdateRef.current = false
        }, 100)
      }, 500)
    },
    [updateNote, extractAndSyncTags]
  )

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
    if (activeNoteIdRef.current && currentNote) {
      updateNote(activeNoteIdRef.current, {
        title: latestTitleRef.current,
        content: latestContentRef.current,
      })
      setSaveStatus('saved')
    }
  }, [currentNote, updateNote])

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
    content: (currentNote?.content as any) || '',
    onUpdate: ({ editor }) => {
      if (activeNoteIdRef.current) {
        debouncedSaveContent(activeNoteIdRef.current, editor.getJSON(), editor.getText())
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[300px] text-ink font-normal leading-relaxed',
      },
    },
  })

  // Synchronize editor content ONLY when not focused and content differs
  useEffect(() => {
    if (selectedNoteId && currentNote) {
      if (document.activeElement !== titleInputRef.current) {
        setLocalTitle(currentNote.title || '')
        latestTitleRef.current = currentNote.title || ''
      }
      latestContentRef.current = currentNote.content

      if (editor && !editor.isFocused && !isInternalUpdateRef.current) {
        const currentJSON = JSON.stringify(editor.getJSON())
        const noteJSON = JSON.stringify(currentNote.content)
        if (currentJSON !== noteJSON) {
          editor.commands.setContent((currentNote.content as any) || '')
        }
      }
    }
  }, [selectedNoteId, currentNote?.title, currentNote?.content])

  // Clean up and flush save on unmount or when note closes
  useEffect(() => {
    return () => {
      flushSave()
    }
  }, [flushSave])

  const handleClose = () => {
    flushSave()
    setSelectedNoteId(null)
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedNoteId) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNoteId])

  if (!selectedNoteId || !currentNote) return null

  const preset =
    NOTE_COLOR_PRESETS.find((p) => p.hex.toLowerCase() === currentNote.color?.toLowerCase()) ||
    NOTE_COLOR_PRESETS[0]
  const bgColor = isDark ? preset.darkBg : currentNote.color || '#FAF8F5'
  const borderColor = isDark ? preset.darkBorder : 'rgba(255,255,255,0.6)'

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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-ink/40 backdrop-blur-md"
          onClick={handleClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-3xl h-[100dvh] sm:h-[88vh] sm:max-h-[850px] rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden shadow-2xl z-10 border border-glass-border"
          style={{ backgroundColor: bgColor, borderColor }}
        >
          {/* TOP FIXED NAVIGATION BAR (Never scrolls off, protected header) */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-glass-border-subtle bg-surface/75 dark:bg-black/35 backdrop-blur-xl z-20">
            {/* Left: Close/Done + Folder Picker + Status Indicator */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated/90 dark:bg-white/10 hover:bg-surface text-ink text-xs font-bold border border-glass-border transition-all shadow-xs"
                title="Done editing"
              >
                <span>Done</span>
              </button>

              <div className="w-36 sm:w-48">
                <GlassDropdown
                  options={folderDropdownOptions}
                  value={currentNote.folder_id || ''}
                  onChange={(val) => updateNote(currentNote.id, { folder_id: val || null })}
                  placeholder="No Folder"
                  size="sm"
                  actionItem={{
                    label: 'Create New Folder...',
                    icon: <PlusIcon size={14} className="text-lavender-accent" />,
                    onClick: () => setIsFolderModalOpen(true),
                  }}
                />
              </div>

              {/* Real-time Saving / Saved Status Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all bg-surface/60 border border-glass-border">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                  )}
                />
                <span className="text-ink-muted">{saveStatus === 'saving' ? 'Saving…' : 'Saved'}</span>
              </div>
            </div>

            {/* Right: Creator Mascot + Pin + Delete */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {creatorUser && (
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-subtle/80 dark:bg-white/5 text-[11px] font-semibold text-ink border border-glass-border">
                  <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={16} />
                  <span>Added by {creatorUser.display_name}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => togglePin(currentNote.id)}
                className={cn(
                  'p-2 rounded-xl transition-colors border',
                  currentNote.is_pinned
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30'
                    : 'bg-surface-subtle/60 text-ink-muted hover:text-ink border-transparent'
                )}
                title={currentNote.is_pinned ? 'Unpin note' : 'Pin note'}
              >
                <PinIcon size={16} className={currentNote.is_pinned ? 'fill-current' : ''} />
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-2 rounded-xl bg-surface-subtle/60 text-ink-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete note"
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
              data-note-id={currentNote.id}
              value={localTitle}
              onChange={(e) => {
                const newTitle = e.target.value
                setLocalTitle(newTitle)
                if (activeNoteIdRef.current) {
                  debouncedSaveTitle(activeNoteIdRef.current, newTitle, editor?.getText() || '')
                }
              }}
              placeholder="Note Title..."
              className="w-full bg-transparent font-extrabold text-2xl sm:text-3xl text-ink tracking-tight outline-none placeholder:text-ink-muted/50 border-b border-glass-border-subtle pb-3"
            />

            {/* Customization Bar: Color Swatches & Tags inside document flow */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-glass-border-subtle/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">Tint:</span>
                <ColorSwatchPicker
                  selectedColor={currentNote.color || '#FAF8F5'}
                  onSelectColor={(color) => updateNote(currentNote.id, { color })}
                />
              </div>

              <div className="flex items-center gap-2">
                <TagPicker noteId={currentNote.id} />
              </div>
            </div>

            {/* Tiptap Rich Text Content Canvas */}
            <div className="flex-1 min-h-[350px] cursor-text pb-20" onClick={() => editor?.commands.focus()}>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* DOCKED FLOATING FORMATTING TOOLBAR (Always pinned at bottom with frosted blur) */}
          <div className="flex-shrink-0 p-3 sm:p-4 bg-surface/80 dark:bg-black/40 backdrop-blur-xl border-t border-glass-border-subtle flex items-center justify-center">
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
              {/* Bold */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('bold')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Bold"
              >
                <Bold size={15} />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('italic')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Italic"
              >
                <Italic size={15} />
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('strike')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Strikethrough"
              >
                <Strikethrough size={15} />
              </button>

              {/* Highlight */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHighlight().run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('highlight')
                    ? 'bg-amber-400 text-amber-950 shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Highlight"
              >
                <Highlighter size={15} />
              </button>

              <div className="w-[1px] h-5 bg-glass-border mx-1" />

              {/* Heading 1 */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('heading', { level: 1 })
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Heading 1"
              >
                <Heading1 size={15} />
              </button>

              {/* Heading 2 */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('heading', { level: 2 })
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Heading 2"
              >
                <Heading2 size={15} />
              </button>

              <div className="w-[1px] h-5 bg-glass-border mx-1" />

              {/* Bullet List */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('bulletList')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Bullet List"
              >
                <List size={15} />
              </button>

              {/* Ordered List */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('orderedList')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Numbered List"
              >
                <ListOrdered size={15} />
              </button>

              {/* Checklist */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('taskList')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Checklist"
              >
                <CheckSquare size={15} />
              </button>

              <div className="w-[1px] h-5 bg-glass-border mx-1" />

              {/* Quote */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('blockquote')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Quote"
              >
                <Quote size={15} />
              </button>

              {/* Code Block */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  editor?.isActive('codeBlock')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                )}
                title="Code Block"
              >
                <Code size={15} />
              </button>

              <div className="w-[1px] h-5 bg-glass-border mx-1" />

              {/* Undo */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-elevated disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="Undo"
              >
                <Undo size={15} />
              </button>

              {/* Redo */}
              <button
                type="button"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface-elevated disabled:opacity-30 disabled:pointer-events-none transition-all"
                title="Redo"
              >
                <Redo size={15} />
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
          softDeleteNote(currentNote.id)
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />

      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
    </AnimatePresence>
  )
}
