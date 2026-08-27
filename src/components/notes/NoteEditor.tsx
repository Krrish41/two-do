import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
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
import { GlassModal } from '../glass/GlassModal'
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

  const currentNote = notes.find((n) => n.id === selectedNoteId)
  const creatorUser = allUsers.find((u) => u.id === currentNote?.created_by)

  // Local state for title to eliminate typing lag and cursor jumping
  const [localTitle, setLocalTitle] = useState(currentNote?.title || '')

  // Refs for tracking active note and debouncing saves
  const activeNoteIdRef = useRef<string | null>(selectedNoteId)
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const contentTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const latestTitleRef = useRef(localTitle)
  const latestContentRef = useRef<any>(currentNote?.content)
  const isInternalUpdateRef = useRef(false)

  latestTitleRef.current = localTitle

  // Keep activeNoteIdRef updated
  useEffect(() => {
    activeNoteIdRef.current = selectedNoteId
  }, [selectedNoteId])

  // Debounced content save function
  const debouncedSaveContent = useCallback(
    (noteId: string, json: any, text: string) => {
      latestContentRef.current = json
      if (contentTimeoutRef.current) {
        clearTimeout(contentTimeoutRef.current)
      }
      contentTimeoutRef.current = setTimeout(() => {
        isInternalUpdateRef.current = true
        updateNote(noteId, { content: json })
        extractAndSyncTags(noteId, `${latestTitleRef.current} ${text}`)
        setTimeout(() => {
          isInternalUpdateRef.current = false
        }, 100)
      }, 350)
    },
    [updateNote, extractAndSyncTags]
  )

  // Debounced title save function
  const debouncedSaveTitle = useCallback(
    (noteId: string, newTitle: string, editorText: string) => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current)
      }
      titleTimeoutRef.current = setTimeout(() => {
        isInternalUpdateRef.current = true
        updateNote(noteId, { title: newTitle })
        extractAndSyncTags(noteId, `${newTitle} ${editorText}`)
        setTimeout(() => {
          isInternalUpdateRef.current = false
        }, 100)
      }, 300)
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
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[220px] px-1 text-ink font-normal',
      },
    },
  })

  // Synchronize editor content ONLY when selected note ID changes (not on every keystroke)
  useEffect(() => {
    if (selectedNoteId && currentNote) {
      setLocalTitle(currentNote.title || '')
      latestTitleRef.current = currentNote.title || ''
      latestContentRef.current = currentNote.content

      if (editor && !isInternalUpdateRef.current) {
        const currentJSON = JSON.stringify(editor.getJSON())
        const noteJSON = JSON.stringify(currentNote.content)
        if (currentJSON !== noteJSON) {
          editor.commands.setContent((currentNote.content as any) || '')
        }
      }
    }
  }, [selectedNoteId])

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

  if (!currentNote) return null

  const preset =
    NOTE_COLOR_PRESETS.find((p) => p.hex.toLowerCase() === currentNote.color?.toLowerCase()) ||
    NOTE_COLOR_PRESETS[0]
  const bgColor = isDark ? preset.darkBg : currentNote.color || '#F4F2EF'
  const borderColor = isDark ? preset.darkBorder : undefined

  // Exclude system folders (Bucket List) so it is not repeated in dropdowns (Section 6)
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
      <GlassModal
        isOpen={Boolean(selectedNoteId)}
        onClose={handleClose}
        maxWidth="2xl"
        showCloseButton={false}
      >
        <div
          className="flex flex-col gap-3.5 sm:gap-4 -m-5 sm:-m-7 p-4 sm:p-7 rounded-3xl transition-colors duration-300 border border-glass-border min-h-full"
          style={{ backgroundColor: bgColor, borderColor }}
        >
          {/* Header Controls: Title & Pin/Delete/Close */}
          <div className="flex items-start justify-between gap-3 border-b border-glass-border-subtle pb-3">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => {
                const newTitle = e.target.value
                setLocalTitle(newTitle)
                if (activeNoteIdRef.current) {
                  debouncedSaveTitle(
                    activeNoteIdRef.current,
                    newTitle,
                    editor?.getText() || ''
                  )
                }
              }}
              placeholder="Note title (supports #tags)..."
              className="w-full bg-transparent font-bold text-xl sm:text-2xl text-ink outline-none placeholder:text-ink-muted tracking-tight"
            />

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => togglePin(currentNote.id)}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  currentNote.is_pinned
                    ? 'bg-ink/10 text-lavender-accent'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title={currentNote.is_pinned ? 'Unpin note' : 'Pin note'}
              >
                <PinIcon size={16} className={cn(currentNote.is_pinned && 'fill-current')} />
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-2 rounded-xl text-ink-muted hover:text-rose-500 hover:bg-rose-500/15 transition-all"
                title="Move to Recycle Bin"
              >
                <TrashIcon size={16} />
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface transition-all"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Folder & Color Palette Settings with Custom GlassDropdown */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface/80 dark:bg-black/25 backdrop-blur-md p-2.5 rounded-2xl border border-glass-border">
            <div className="w-48 sm:w-56">
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

            {/* Read-Only Creator Mascot Attribution in Note Editor */}
            {creatorUser && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-surface-subtle/80 dark:bg-black/20 text-xs font-semibold text-ink border border-glass-border">
                <CoupleAvatar userId={creatorUser.id} displayName={creatorUser.display_name} size={16} />
                <span>Added by {creatorUser.display_name}</span>
              </div>
            )}

            <ColorSwatchPicker
              selectedColor={currentNote.color || NOTE_COLOR_PRESETS[0].hex}
              onSelectColor={(hex) => updateNote(currentNote.id, { color: hex })}
            />
          </div>

          {/* Tag Picker */}
          <TagPicker noteId={currentNote.id} />

          {/* Tiptap Formatting Toolbar */}
          {editor && (
            <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-2xl bg-surface-elevated/80 dark:bg-black/30 backdrop-blur-md border border-glass-border shadow-xs">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('bold')
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('italic')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('strike')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('highlight')
                    ? 'bg-amber-400 text-slate-900 shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Highlight"
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-glass-border-subtle mx-1" />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('heading', { level: 1 })
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Heading 1"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('heading', { level: 2 })
                    ? 'bg-lavender-accent text-white shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-glass-border-subtle mx-1" />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('bulletList')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('orderedList')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('taskList')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Task List"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-glass-border-subtle mx-1" />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('blockquote')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Quote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  editor.isActive('codeBlock')
                    ? 'bg-lavender-accent text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )}
                title="Code Block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-glass-border-subtle mx-1" />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-1.5 rounded-lg text-ink-subtle hover:text-ink disabled:opacity-30 transition-colors"
                title="Undo"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-1.5 rounded-lg text-ink-subtle hover:text-ink disabled:opacity-30 transition-colors"
                title="Redo"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Editor Body */}
          <div className="p-4 rounded-2xl bg-surface-elevated/70 dark:bg-black/20 backdrop-blur-md border border-glass-border min-h-[240px] focus-within:ring-2 focus-within:ring-lavender-accent/20 transition-all">
            <EditorContent editor={editor} />
          </div>
        </div>
      </GlassModal>

      {/* Glass Confirmation Dialog for Moving Note to Recycle Bin */}
      <GlassConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Move to Recycle Bin?"
        description="This note will be moved to the Recycle Bin. You can restore it anytime within 30 days."
        confirmText="Move to Bin"
        variant="danger"
        onConfirm={() => {
          setIsDeleteConfirmOpen(false)
          softDeleteNote(currentNote.id)
        }}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />

      {/* New Folder Modal */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onCreated={(id) => updateNote(currentNote.id, { folder_id: id })}
      />
    </>
  )
}
