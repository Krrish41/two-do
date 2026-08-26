import React, { useEffect, useState } from 'react'
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
  Pin,
  Trash2,
  Folder as FolderIcon,
  User,
} from 'lucide-react'
import { GlassModal } from '../glass/GlassModal'
import { GlassConfirmDialog } from '../glass/GlassConfirmDialog'
import { ColorSwatchPicker } from './ColorSwatchPicker'
import { TagPicker } from './TagPicker'
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

  const currentNote = notes.find((n) => n.id === selectedNoteId)
  const creatorUser = allUsers.find((u) => u.id === currentNote?.created_by)

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
    // justified: Tiptap JSON document structure from Database.Json
    content: (currentNote?.content as any) || '',
    onUpdate: ({ editor }) => {
      if (currentNote) {
        updateNote(currentNote.id, { content: editor.getJSON() })
        const text = editor.getText()
        extractAndSyncTags(currentNote.id, `${currentNote.title} ${text}`)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[220px] max-h-[500px] overflow-y-auto px-1 text-ink',
      },
    },
  })

  // Synchronize editor content when selected note changes
  useEffect(() => {
    if (editor && currentNote) {
      const currentJSON = JSON.stringify(editor.getJSON())
      const noteJSON = JSON.stringify(currentNote.content)
      if (currentJSON !== noteJSON) {
        // justified: Tiptap JSON document structure from Database.Json
        editor.commands.setContent((currentNote.content as any) || '')
      }
    }
  }, [selectedNoteId, editor, currentNote])

  if (!currentNote) return null

  const preset = NOTE_COLOR_PRESETS.find((p) => p.hex === currentNote.color)
  const bgColor = isDark
    ? preset?.darkBg || 'rgba(255,255,255,0.08)'
    : currentNote.color || '#F4F2EF'

  return (
    <>
      <GlassModal
        isOpen={Boolean(selectedNoteId)}
        onClose={() => setSelectedNoteId(null)}
        maxWidth="2xl"
        showCloseButton={true}
      >
        <div
          className="flex flex-col gap-4 -m-6 sm:-m-7 p-6 sm:p-7 rounded-3xl transition-colors duration-300 border border-glass-border"
          style={{ backgroundColor: bgColor }}
        >
          {/* Header Controls: Title & Pin/Delete */}
          <div className="flex items-start justify-between gap-4 border-b border-glass-border-subtle pb-3">
            <input
              type="text"
              value={currentNote.title}
              onChange={(e) => {
                updateNote(currentNote.id, { title: e.target.value })
                extractAndSyncTags(currentNote.id, e.target.value)
              }}
              placeholder="Note title (supports #tags)..."
              className="w-full bg-transparent font-bold text-xl sm:text-2xl text-ink outline-none placeholder:text-ink-muted tracking-tight"
            />

            <div className="flex items-center gap-1">
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
                <Pin className={cn('w-4 h-4', currentNote.is_pinned && 'fill-current')} />
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-2 rounded-xl text-ink-muted hover:text-rose-500 hover:bg-rose-500/15 transition-all"
                title="Move to Recycle Bin"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Folder & Color Palette Settings */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-2.5 rounded-2xl border border-glass-border">
            <div className="flex items-center gap-2">
              <FolderIcon className="w-3.5 h-3.5 text-ink-muted" />
              <select
                value={currentNote.folder_id || ''}
                onChange={(e) =>
                  updateNote(currentNote.id, { folder_id: e.target.value || null })
                }
                className="bg-transparent text-xs font-semibold text-ink outline-none cursor-pointer"
              >
                <option value="">No Folder</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.icon || '📁'} {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Read-Only Creator Attribution in Note Editor */}
            {creatorUser && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-subtle text-xs font-medium text-ink-muted">
                <User className="w-3 h-3 text-lavender-accent" />
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: creatorUser.accent_color || '#B8A9E8' }}
                />
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
            <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-2xl bg-surface-elevated border border-glass-border shadow-xs">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('bold') && 'bg-ink/10 text-ink font-bold'
                )}
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('italic') && 'bg-ink/10 text-ink'
                )}
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('strike') && 'bg-ink/10 text-ink'
                )}
                title="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('highlight') && 'bg-amber-400/30 text-ink font-bold'
                )}
                title="Highlight"
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-glass-border-subtle mx-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('heading', { level: 1 }) && 'bg-ink/10 text-ink font-bold'
                )}
                title="Heading 1"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('heading', { level: 2 }) && 'bg-ink/10 text-ink font-bold'
                )}
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-glass-border-subtle mx-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('bulletList') && 'bg-ink/10 text-ink'
                )}
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('orderedList') && 'bg-ink/10 text-ink'
                )}
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('taskList') && 'bg-ink/10 text-ink'
                )}
                title="Task List"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-glass-border-subtle mx-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('blockquote') && 'bg-ink/10 text-ink'
                )}
                title="Quote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(
                  'p-1.5 rounded-lg text-ink-muted hover:text-ink transition-colors',
                  editor.isActive('codeBlock') && 'bg-ink/10 text-ink'
                )}
                title="Code Block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-glass-border-subtle mx-1" />

              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-1.5 rounded-lg text-ink-subtle hover:text-ink disabled:opacity-30 transition-colors"
                title="Undo"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
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
          <div className="p-4 rounded-2xl bg-surface-elevated border border-glass-border min-h-[240px] focus-within:ring-2 focus-within:ring-lavender-accent/20 transition-all">
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
    </>
  )
}
