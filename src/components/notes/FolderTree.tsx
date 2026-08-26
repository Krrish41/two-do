import React, { useState } from 'react'
import {
  Folder as FolderIcon,
  FolderOpen,
  Plus,
  Trash2,
  Layers,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { useNoteStore } from '../../stores/noteStore'
import { cn } from '../../lib/utils'

export interface FolderTreeProps {
  className?: string
}

export const FolderTree: React.FC<FolderTreeProps> = ({ className }) => {
  const folders = useNoteStore((s) => s.folders)
  const notes = useNoteStore((s) => s.notes)
  const selectedFolderId = useNoteStore((s) => s.selectedFolderId)
  const setSelectedFolderId = useNoteStore((s) => s.setSelectedFolderId)
  const createFolder = useNoteStore((s) => s.createFolder)
  const deleteFolder = useNoteStore((s) => s.deleteFolder)

  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    await createFolder(newFolderName.trim())
    setNewFolderName('')
    setIsCreating(false)
  }

  // Root level folders
  const rootFolders = folders.filter((f) => !f.parent_folder_id)

  const renderFolderItem = (folder: typeof folders[0], level = 0) => {
    const isSelected = selectedFolderId === folder.id
    const childFolders = folders.filter((f) => f.parent_folder_id === folder.id)
    const isExpanded = expandedFolders[folder.id] ?? true
    const noteCount = notes.filter((n) => n.folder_id === folder.id).length

    return (
      <div key={folder.id} className="flex flex-col">
        <div
          onClick={() => setSelectedFolderId(isSelected ? null : folder.id)}
          style={{ paddingLeft: `${level * 12 + 10}px` }}
          className={cn(
            'group flex items-center justify-between py-2 pr-3 rounded-xl text-xs font-medium cursor-pointer transition-all',
            isSelected
              ? 'bg-lavender-600/15 text-lavender-600 font-semibold'
              : 'text-ink/70 hover:bg-white/50 hover:text-ink'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            {childFolders.length > 0 ? (
              <button
                onClick={(e) => toggleExpand(folder.id, e)}
                className="p-0.5 text-ink/40 hover:text-ink"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : (
              <div className="w-3" />
            )}
            {isSelected ? (
              <FolderOpen className="w-3.5 h-3.5 text-lavender-600 flex-shrink-0" />
            ) : (
              <FolderIcon className="w-3.5 h-3.5 text-ink/50 flex-shrink-0" />
            )}
            <span className="truncate">{folder.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-ink/40 bg-black/5 px-1.5 py-0.2 rounded-full">
              {noteCount}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm(`Delete folder "${folder.name}"?`)) {
                  deleteFolder(folder.id)
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-500 text-ink/30 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isExpanded && childFolders.length > 0 && (
          <div className="flex flex-col">
            {childFolders.map((child) => renderFolderItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-bold text-ink/60 uppercase tracking-wider">Folders</span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 rounded-lg text-ink/60 hover:text-ink hover:bg-white/60 transition-colors"
          title="Create Folder"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* All Notes Quick Filter */}
      <div
        onClick={() => setSelectedFolderId(null)}
        className={cn(
          'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all',
          selectedFolderId === null
            ? 'bg-lavender-600/15 text-lavender-600 font-semibold'
            : 'text-ink/70 hover:bg-white/50 hover:text-ink'
        )}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5" />
          <span>All Notes</span>
        </div>
        <span className="text-[10px] text-ink/40 bg-black/5 px-1.5 py-0.2 rounded-full">
          {notes.length}
        </span>
      </div>

      {/* Folder Tree Items */}
      <div className="flex flex-col gap-0.5">
        {rootFolders.map((folder) => renderFolderItem(folder))}
      </div>

      {/* Add Folder Input */}
      {isCreating && (
        <form onSubmit={handleCreateFolder} className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/70 border border-black/5 mt-1">
          <FolderIcon className="w-3.5 h-3.5 text-ink/40 ml-1" />
          <input
            type="text"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="bg-transparent text-xs text-ink outline-none flex-1 placeholder:text-ink/40"
            autoFocus
          />
          <button type="submit" className="px-2 py-0.5 rounded-md bg-lavender-600 text-white text-xs font-medium">
            Add
          </button>
          <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-ink/40 hover:text-ink">
            ✕
          </button>
        </form>
      )}
    </div>
  )
}
