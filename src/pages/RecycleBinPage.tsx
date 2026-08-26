import React, { useState } from 'react'
import { Trash, Trash2 } from 'lucide-react'
import { NoteCard } from '../components/notes/NoteCard'
import { GlassButton } from '../components/glass/GlassButton'
import { GlassConfirmDialog } from '../components/glass/GlassConfirmDialog'
import { useNoteStore } from '../stores/noteStore'

export const RecycleBinPage: React.FC = () => {
  const notes = useNoteStore((s) => s.notes)
  const emptyRecycleBin = useNoteStore((s) => s.emptyRecycleBin)
  const [isEmptyConfirmOpen, setIsEmptyConfirmOpen] = useState(false)

  const deletedNotes = notes
    .filter((n) => n.deleted_at !== null)
    .sort((a, b) => new Date(b.deleted_at || 0).getTime() - new Date(a.deleted_at || 0).getTime())

  return (
    <>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-ink-muted font-bold text-xs uppercase tracking-wider mb-1">
              <Trash className="w-4 h-4" />
              <span>Recycle Bin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Deleted Notes & Memos
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Items in the recycle bin are kept for 30 days before being permanently removed.
            </p>
          </div>

          {deletedNotes.length > 0 && (
            <GlassButton
              onClick={() => setIsEmptyConfirmOpen(true)}
              variant="danger"
              size="sm"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Empty Bin
            </GlassButton>
          )}
        </div>

        {/* Empty State */}
        {deletedNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-16 h-16 rounded-full glass-panel-subtle flex items-center justify-center mb-4 text-ink-muted">
              <Trash className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="text-base font-semibold text-ink">Recycle Bin is empty</h3>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 max-w-sm">
              Deleted notes will appear here where you can restore them anytime within 30 days.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deletedNotes.map((note) => (
              <NoteCard key={note.id} note={note} isRecycleBin={true} />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Emptying Recycle Bin */}
      <GlassConfirmDialog
        isOpen={isEmptyConfirmOpen}
        title="Empty Recycle Bin?"
        description="All deleted notes in the bin will be permanently destroyed. This action cannot be undone."
        confirmText="Empty Bin"
        variant="danger"
        onConfirm={() => {
          setIsEmptyConfirmOpen(false)
          emptyRecycleBin()
        }}
        onCancel={() => setIsEmptyConfirmOpen(false)}
      />
    </>
  )
}
