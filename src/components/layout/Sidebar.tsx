import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Sun,
  CheckCircle2,
  StickyNote,
  LogOut,
  Flame,
  CheckCheck,
  Heart,
  Plus,
  Trash2,
  Trash,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useTaskStore } from '../../stores/taskStore'
import { useNoteStore } from '../../stores/noteStore'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '../../lib/utils'

export const Sidebar: React.FC = () => {
  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)
  const signOut = useAuthStore((s) => s.signOut)

  const tasks = useTaskStore((s) => s.tasks)
  const notes = useNoteStore((s) => s.notes)
  const folders = useNoteStore((s) => s.folders)
  const createFolder = useNoteStore((s) => s.createFolder)
  const deleteFolder = useNoteStore((s) => s.deleteFolder)

  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderIcon, setNewFolderIcon] = useState('📁')
  const [newFolderColor, setNewFolderColor] = useState('#C4AEF0')

  const todayStr = new Date().toISOString().split('T')[0]
  const myDayCount = tasks.filter(
    (t) => !t.is_completed && (t.is_my_day_date === todayStr || t.due_date === todayStr)
  ).length
  const allTasksCount = tasks.filter((t) => !t.is_completed).length
  const importantCount = tasks.filter((t) => !t.is_completed && t.priority >= 2).length
  const notesCount = notes.filter((n) => n.deleted_at === null).length
  const completedCount = tasks.filter((t) => t.is_completed).length
  const bucketListCount =
    tasks.filter((t) => !t.is_completed && t.folder_id === 'folder-bucket-list').length +
    notes.filter((n) => n.deleted_at === null && n.folder_id === 'folder-bucket-list').length
  const recycleBinCount = notes.filter((n) => n.deleted_at !== null).length

  const viewItems = [
    { to: '/today', label: 'My Day', icon: Sun, badge: myDayCount > 0 ? myDayCount : null, color: 'text-amber-500' },
    { to: '/tasks', label: 'All Tasks', icon: CheckCircle2, badge: allTasksCount > 0 ? allTasksCount : null, color: 'text-lavender-accent' },
    { to: '/important', label: 'Important', icon: Flame, badge: importantCount > 0 ? importantCount : null, color: 'text-rose-500' },
    { to: '/notes', label: 'Notes & Memos', icon: StickyNote, badge: notesCount > 0 ? notesCount : null, color: 'text-skyblue-accent' },
    { to: '/completed', label: 'Completed', icon: CheckCheck, badge: completedCount > 0 ? completedCount : null, color: 'text-emerald-500' },
    { to: '/bucket-list', label: 'Bucket List', icon: Heart, badge: bucketListCount > 0 ? bucketListCount : null, color: 'text-blossom-accent' },
  ]

  const userFolders = folders.filter((f) => !f.is_system && !f.parent_folder_id)

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    await createFolder(newFolderName.trim(), newFolderIcon, newFolderColor)
    setNewFolderName('')
    setIsCreatingFolder(false)
  }

  const FOLDER_EMOJIS = ['📁', '🚀', '✨', '📚', '💼', '🏡', '🎨', '🏖️', '💡']
  const FOLDER_COLORS = ['#C4AEF0', '#A7C7E7', '#F5A9C9', '#5ED99E', '#FBBF24']

  return (
    <aside className="w-72 hidden md:flex flex-col h-[calc(100vh-2rem)] sticky top-4 my-4 ml-4 rounded-3xl glass-panel p-5 justify-between select-none shadow-glass overflow-hidden">
      <div className="flex flex-col gap-5 overflow-y-auto pr-1">
        {/* Rebranded Header: Two-Orb Logo */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2.5">
            <img src="./logo.svg" alt="Two-Do" className="w-9 h-9 flex-shrink-0 drop-shadow-sm" />
            <div>
              <h1 className="font-extrabold text-lg text-ink tracking-tight">Two-Do</h1>
              <p className="text-[11px] font-medium text-ink-muted">Private Duo Workspace</p>
            </div>
          </div>

          <ThemeToggle size="sm" />
        </div>

        {/* Duo Members Pill */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl glass-panel-subtle text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: authorizedUser?.accent_color || '#B8A9E8' }}
            >
              {authorizedUser?.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-ink truncate text-[11px]">
                {authorizedUser?.display_name || 'Active User'}
              </div>
              <div className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </div>
            </div>
          </div>

          {partnerUser && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-xl bg-surface text-ink-muted text-[10px]"
              title={`Partner: ${partnerUser.display_name}`}
            >
              <div
                className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ backgroundColor: partnerUser.accent_color || '#A7C7E7' }}
              >
                {partnerUser.display_name?.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[50px]">{partnerUser.display_name}</span>
            </div>
          )}
        </div>

        {/* Section: Views */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider px-3 mb-1">
            Views
          </span>
          {viewItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-surface-elevated text-ink shadow-sm border border-glass-border scale-[1.01]'
                    : 'text-ink-muted hover:bg-surface hover:text-ink'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={cn('w-4 h-4 transition-transform', item.color, isActive && 'scale-110')}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        isActive
                          ? 'bg-lavender-500/15 text-lavender-accent'
                          : 'bg-surface text-ink-muted'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Section: Folders & Projects */}
        <div className="flex flex-col gap-1 pt-2 border-t border-glass-border-subtle">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              Folders & Projects
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingFolder(true)}
              className="p-1 rounded-lg text-ink-muted hover:text-ink hover:bg-surface transition-colors"
              title="New Folder"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Folder List */}
          <div className="flex flex-col gap-0.5">
            {userFolders.map((folder) => {
              const count =
                tasks.filter((t) => !t.is_completed && t.folder_id === folder.id).length +
                notes.filter((n) => n.deleted_at === null && n.folder_id === folder.id).length

              return (
                <NavLink
                  key={folder.id}
                  to={`/folder/${folder.id}`}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-surface-elevated text-ink shadow-sm border border-glass-border'
                        : 'text-ink-muted hover:bg-surface hover:text-ink'
                    )
                  }
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{folder.icon || '📁'}</span>
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {count > 0 && (
                      <span className="text-[10px] text-ink-subtle bg-surface px-1.5 py-0.2 rounded-full">
                        {count}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (window.confirm(`Delete folder "${folder.name}"?`)) {
                          deleteFolder(folder.id)
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-500 text-ink-subtle transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </NavLink>
              )
            })}
          </div>

          {/* New Folder Form */}
          {isCreatingFolder && (
            <form onSubmit={handleCreateFolder} className="p-3 rounded-2xl bg-surface border border-glass-border flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2">
                <select
                  value={newFolderIcon}
                  onChange={(e) => setNewFolderIcon(e.target.value)}
                  className="bg-transparent text-sm outline-none cursor-pointer"
                >
                  {FOLDER_EMOJIS.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-ink-muted font-medium"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-glass-border-subtle">
                <div className="flex items-center gap-1">
                  {FOLDER_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewFolderColor(c)}
                      style={{ backgroundColor: c }}
                      className={cn(
                        'w-3 h-3 rounded-full',
                        newFolderColor === c && 'ring-1 ring-ink ring-offset-1'
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded-lg bg-lavender-accent text-white text-[11px] font-bold"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingFolder(false)}
                    className="text-[11px] text-ink-muted hover:text-ink px-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer: Recycle Bin & Sign Out */}
      <div className="pt-3 border-t border-glass-border-subtle flex flex-col gap-2">
        {/* Recycle Bin Link */}
        <NavLink
          to="/recycle-bin"
          className={({ isActive }) =>
            cn(
              'flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors',
              isActive
                ? 'bg-surface text-ink font-semibold'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
            )
          }
        >
          <div className="flex items-center gap-2">
            <Trash className="w-3.5 h-3.5 text-ink-subtle" />
            <span>Recycle Bin</span>
          </div>
          {recycleBinCount > 0 && (
            <span className="text-[10px] text-ink-muted bg-surface px-1.5 py-0.2 rounded-full">
              {recycleBinCount}
            </span>
          )}
        </NavLink>

        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-ink-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
          <span className="text-[10px] text-ink-subtle font-medium">Two-Do v2</span>
        </div>
      </div>
    </aside>
  )
}
