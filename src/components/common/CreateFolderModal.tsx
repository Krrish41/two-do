import React, { useState } from 'react'
import { GlassModal } from '../glass/GlassModal'
import { GlassInput } from '../glass/GlassInput'
import { GlassButton } from '../glass/GlassButton'
import { FOLDER_ICON_OPTIONS } from './FolderIconRenderer'
import { useNoteStore } from '../../stores/noteStore'
import { cn } from '../../lib/utils'

export interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (folderId: string) => void
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const createFolder = useNoteStore((s) => s.createFolder)
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('folder')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      const folder = await createFolder(name.trim(), selectedIcon)
      setName('')
      setSelectedIcon('folder')
      onClose()
      if (folder?.id && onCreated) {
        onCreated(folder.id)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Folder"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Icon Selection Grid */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-ink-muted">Choose Icon</label>
          <div className="grid grid-cols-6 gap-2 p-2 rounded-2xl bg-surface border border-glass-border">
            {FOLDER_ICON_OPTIONS.map((opt) => {
              const IconComp = opt.icon
              const isSelected = selectedIcon === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedIcon(opt.id)}
                  className={cn(
                    'p-2.5 rounded-xl flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-lavender-accent/20 ring-2 ring-lavender-accent shadow-xs scale-105'
                      : 'hover:bg-surface-elevated text-ink-muted hover:text-ink'
                  )}
                  title={opt.label}
                >
                  <IconComp size={20} className={opt.color} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Folder Name Input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-ink-muted">Folder Name</label>
          <GlassInput
            placeholder="e.g. Travel Plans, Work Projects, Home..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <GlassButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </GlassButton>
          <GlassButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Folder'}
          </GlassButton>
        </div>
      </form>
    </GlassModal>
  )
}
