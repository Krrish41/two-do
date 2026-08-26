import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  SunIcon,
  CheckCircleIcon,
  FlameIcon,
  NotesIcon,
  CheckCheckIcon,
  HeartIcon,
  TrashIcon,
  PlusIcon,
  FolderIcon,
  LogOutIcon,
  CloseIcon,
} from '../icons'
import { CoupleAvatar } from '../common/CoupleAvatar'
import { ThemeToggle } from './ThemeToggle'
import { GlassModal } from '../glass/GlassModal'
import { GlassInput } from '../glass/GlassInput'
import { GlassButton } from '../glass/GlassButton'
import { GlassConfirmDialog } from '../glass/GlassConfirmDialog'
import { useTaskStore } from '../../stores/taskStore'
import { useNoteStore } from '../../stores/noteStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

export interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const tasks = useTaskStore((s) => s.tasks)
  const notes = useNoteStore((s) => s.notes)
  const folders = useNoteStore((s) => s.folders)
  const createFolder = useNoteStore((s) => s.createFolder)
  const deleteFolder = useNoteStore((s) => s.deleteFolder)

  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const signOut = useAuthStore((s) => s.signOut)

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderIcon, setNewFolderIcon] = useState('📁')
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]

  // Count active items
  const todayCount = tasks.filter(
    (t) => (t.is_my_day_date === todayStr || t.due_date === todayStr) && !t.is_completed && t.deleted_at === null
  ).length
  const allTasksCount = tasks.filter((t) => !t.parent_task_id && !t.is_completed && t.deleted_at === null).length
  const importantCount = tasks.filter((t) => t.priority >= 2 && !t.is_completed && t.deleted_at === null).length
  const notesCount = notes.filter((n) => n.deleted_at === null).length

  // Bucket list UUID folder
  const bucketListFolder = folders.find(
    (f) => f.slug === 'bucket-list' || (f.is_system && f.name === 'Bucket List')
  )
  const bucketListFolderId = bucketListFolder?.id
  const bucketListCount = tasks.filter(
    (t) =>
      ((bucketListFolderId && t.folder_id === bucketListFolderId) ||
        t.title.toLowerCase().includes('bucket')) &&
      !t.is_completed &&
      t.deleted_at === null
  ).length

  // Custom User Folders (excluding system folders like Bucket List)
  const customFolders = folders.filter((f) => !f.is_system && f.slug !== 'bucket-list')

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    await createFolder(newFolderName.trim(), newFolderIcon)
    setNewFolderName('')
    setNewFolderIcon('📁')
    setIsFolderModalOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    { to: '/today', label: 'Today', icon: SunIcon, count: todayCount, color: 'text-amber-500' },
    { to: '/tasks', label: 'All Tasks', icon: CheckCircleIcon, count: allTasksCount, color: 'text-lavender-accent' },
    { to: '/important', label: 'Important', icon: FlameIcon, count: importantCount, color: 'text-rose-500' },
    { to: '/notes', label: 'Notes', icon: NotesIcon, count: notesCount, color: 'text-skyblue-accent' },
    { to: '/completed', label: 'Completed', icon: CheckCheckIcon, count: null, color: 'text-emerald-500' },
    { to: '/bucket-list', label: 'Bucket List', icon: HeartIcon, count: bucketListCount, color: 'text-blossom-accent' },
  ]

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out',
          'md:static md:translate-x-0 md:m-3 md:h-[calc(100vh-1.5rem)] md:rounded-3xl',
          'glass-panel border border-glass-border shadow-2xl md:shadow-glass',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Logo & Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <img
                src="./logo.svg"
                alt="Two-Do"
                className="w-10 h-10 drop-shadow-md transition-transform hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-ink tracking-tight">Two-Do</span>
                <span className="text-[11px] font-semibold text-ink-muted">Yours, mine, ours.</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-surface transition-colors"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          {/* Core Views Navigation */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-ink-subtle mb-1">
              Views
            </span>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 group select-none',
                      isActive
                        ? 'bg-lavender-accent/15 text-lavender-accent font-bold shadow-xs border border-lavender-accent/25'
                        : 'text-ink-muted hover:text-ink hover:bg-surface'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 truncate">
                        <Icon size={18} className={cn('transition-transform group-hover:scale-110 flex-shrink-0', isActive ? 'text-lavender-accent' : item.color)} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && item.count > 0 && (
                        <span
                          className={cn(
                            'px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors',
                            isActive
                              ? 'bg-lavender-accent text-white'
                              : 'bg-surface text-ink-muted group-hover:bg-surface-elevated'
                          )}
                        >
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>

          {/* Custom Folders & Projects */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                Folders & Projects
              </span>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(true)}
                className="p-1 rounded-lg text-ink-subtle hover:text-lavender-accent hover:bg-surface transition-colors"
                title="Create new folder"
              >
                <PlusIcon size={16} />
              </button>
            </div>

            {customFolders.length === 0 ? (
              <div className="px-3 py-2 text-xs text-ink-subtle italic">No folders yet</div>
            ) : (
              customFolders.map((folder) => {
                const folderTaskCount = tasks.filter(
                  (t) => t.folder_id === folder.id && !t.is_completed && t.deleted_at === null
                ).length

                return (
                  <div
                    key={folder.id}
                    className="group flex items-center justify-between rounded-2xl hover:bg-surface transition-colors pr-2"
                  >
                    <NavLink
                      to={`/folder/${folder.id}`}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors flex-1 truncate select-none',
                          isActive
                            ? 'text-lavender-accent font-bold'
                            : 'text-ink-muted group-hover:text-ink'
                        )
                      }
                    >
                      {folder.icon && folder.icon !== '📁' && folder.icon !== '📂' ? (
                        <span className="text-base flex-shrink-0">{folder.icon}</span>
                      ) : (
                        <FolderIcon size={18} className="text-amber-500 flex-shrink-0" />
                      )}
                      <span className="truncate">{folder.name}</span>
                    </NavLink>

                    <div className="flex items-center gap-1">
                      {folderTaskCount > 0 && (
                        <span className="text-[11px] text-ink-subtle font-semibold px-1.5">
                          {folderTaskCount}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setFolderToDelete({ id: folder.id, name: folder.name })}
                        className="opacity-0 group-hover:opacity-100 p-1 text-ink-subtle hover:text-rose-500 transition-opacity"
                        title="Delete folder"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Recycle Bin Navigation */}
          <div className="flex flex-col gap-1 pt-2 border-t border-glass-border-subtle">
            <NavLink
              to="/recycle-bin"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 group select-none',
                  isActive
                    ? 'bg-lavender-accent/15 text-lavender-accent font-bold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface'
                )
              }
            >
              <div className="flex items-center gap-3">
                <TrashIcon size={18} className="text-ink-subtle group-hover:text-rose-500 transition-colors" />
                <span>Recycle Bin</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* User Footer Profile & Mascot Avatars */}
        <div className="pt-4 border-t border-glass-border-subtle flex flex-col gap-3">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-surface border border-glass-border">
            <div className="flex items-center gap-2.5 truncate">
              {authorizedUser && (
                <CoupleAvatar
                  userId={authorizedUser.id}
                  displayName={authorizedUser.display_name}
                  size={32}
                  showOnlineBadge={true}
                />
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-ink truncate">
                  {authorizedUser?.display_name || 'Dr. Bubs'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <ThemeToggle size="sm" />
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="p-2 rounded-xl text-ink-subtle hover:text-rose-500 hover:bg-surface-elevated transition-colors"
                title="Sign Out"
              >
                <LogOutIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* New Folder Modal */}
      <GlassModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="Create New Folder"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-2 rounded-xl bg-surface border border-glass-border">
              {['📁', '💼', '🏡', '✈️', '🎨', '💡', '📚', '🎯'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewFolderIcon(emoji)}
                  className={cn(
                    'p-1.5 rounded-lg text-lg transition-transform',
                    newFolderIcon === emoji ? 'bg-lavender-accent/20 scale-110' : 'hover:bg-surface'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-ink-muted">Folder Name</label>
            <GlassInput
              placeholder="e.g. Vacation Plans, Renovations..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <GlassButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsFolderModalOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" disabled={!newFolderName.trim()}>
              Create Folder
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Modern Glass Confirm Dialog for Folder Deletion */}
      <GlassConfirmDialog
        isOpen={Boolean(folderToDelete)}
        title="Delete Folder?"
        description={`Are you sure you want to delete "${folderToDelete?.name}"? Tasks and notes in this folder will not be deleted.`}
        confirmText="Delete Folder"
        variant="danger"
        onConfirm={() => {
          if (folderToDelete) {
            deleteFolder(folderToDelete.id)
            setFolderToDelete(null)
          }
        }}
        onCancel={() => setFolderToDelete(null)}
      />

      {/* Modern Glass Confirm Dialog for Logout */}
      <GlassConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="Sign Out?"
        description="Are you sure you want to log out of Two-Do?"
        confirmText="Sign Out"
        variant="primary"
        onConfirm={() => {
          setIsLogoutConfirmOpen(false)
          handleSignOut()
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </>
  )
}
