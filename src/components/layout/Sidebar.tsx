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
  LogOutIcon,
} from '../icons'
import { CoupleAvatar } from '../common/CoupleAvatar'
import { ThemeToggle } from './ThemeToggle'
import { GlassConfirmDialog } from '../glass/GlassConfirmDialog'
import { FolderIconRenderer } from '../common/FolderIconRenderer'
import { CreateFolderModal } from '../common/CreateFolderModal'
import { useTaskStore } from '../../stores/taskStore'
import { useNoteStore } from '../../stores/noteStore'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

export interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate()
  const tasks = useTaskStore((s) => s.tasks)
  const notes = useNoteStore((s) => s.notes)
  const folders = useNoteStore((s) => s.folders)
  const deleteFolder = useNoteStore((s) => s.deleteFolder)

  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const signOut = useAuthStore((s) => s.signOut)

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
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

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navItems = [
    {
      to: '/today',
      label: 'Today',
      icon: SunIcon,
      count: todayCount,
      color: 'text-amber-500',
      activeBadge: 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/35',
    },
    {
      to: '/tasks',
      label: 'All Tasks',
      icon: CheckCircleIcon,
      count: allTasksCount,
      color: 'text-lavender-accent',
      activeBadge: 'bg-lavender-accent/25 text-lavender-accent dark:text-[#E4DBF7] border border-lavender-accent/35',
    },
    {
      to: '/important',
      label: 'Important',
      icon: FlameIcon,
      count: importantCount,
      color: 'text-rose-500',
      activeBadge: 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/35',
    },
    {
      to: '/notes',
      label: 'Notes',
      icon: NotesIcon,
      count: notesCount,
      color: 'text-skyblue-accent',
      activeBadge: 'bg-lavender-accent/25 text-lavender-accent dark:text-[#E4DBF7] border border-lavender-accent/35',
    },
    {
      to: '/completed',
      label: 'Completed',
      icon: CheckCheckIcon,
      count: null,
      color: 'text-emerald-500',
      activeBadge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/35',
    },
    {
      to: '/bucket-list',
      label: 'Bucket List',
      icon: HeartIcon,
      count: bucketListCount,
      color: 'text-blossom-accent',
      activeBadge: 'bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/35',
    },
  ]

  return (
    <>
      <aside
        className={cn(
          'hidden md:flex flex-col justify-between w-72 p-4 m-3 sticky top-3 self-start h-[calc(100vh-1.5rem)] rounded-3xl flex-shrink-0 z-30',
          'glass-panel border border-glass-border shadow-glass'
        )}
      >
        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Logo & Header */}
          <div className="flex items-center gap-3 px-2 pt-2">
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
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors duration-150 group select-none border',
                      isActive
                        ? 'bg-lavender-accent/15 text-lavender-accent font-bold shadow-xs border-lavender-accent/25'
                        : 'text-ink-muted hover:text-ink hover:bg-surface border-transparent'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 truncate">
                        <Icon size={18} className={cn('flex-shrink-0', isActive ? 'text-lavender-accent' : item.color)} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && item.count > 0 && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-bold transition-colors',
                            isActive
                              ? cn(item.activeBadge, 'shadow-xs font-extrabold')
                              : 'bg-surface-subtle text-ink-muted group-hover:bg-surface-elevated'
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

          {/* Folders & Projects Navigation */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                Folders & Projects
              </span>
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="p-1 rounded-lg text-ink-muted hover:text-lavender-accent hover:bg-surface transition-colors"
                title="Create New Folder"
              >
                <PlusIcon size={14} />
              </button>
            </div>

            {customFolders.map((folder) => {
              const folderTaskCount = tasks.filter(
                (t) => t.folder_id === folder.id && !t.is_completed && t.deleted_at === null
              ).length

              return (
                <NavLink
                  key={folder.id}
                  to={`/folder/${folder.id}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors duration-150 group select-none border',
                      isActive
                        ? 'bg-lavender-accent/15 text-lavender-accent font-bold shadow-xs border-lavender-accent/25'
                        : 'text-ink-muted hover:text-ink hover:bg-surface border-transparent'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3 truncate">
                        <FolderIconRenderer icon={folder.icon} size={18} className="flex-shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                        {folderTaskCount > 0 && (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-bold transition-colors',
                              isActive
                                ? 'bg-lavender-accent/25 text-lavender-accent dark:text-[#E4DBF7] border border-lavender-accent/35 shadow-xs'
                                : 'bg-surface-subtle text-ink-muted'
                            )}
                          >
                            {folderTaskCount}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setFolderToDelete({ id: folder.id, name: folder.name })
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-ink-muted hover:text-rose-500 hover:bg-surface transition-all"
                          title="Delete Folder"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>

          {/* Recycle Bin Navigation */}
          <div className="flex flex-col gap-1 pt-2 border-t border-glass-border-subtle">
            <NavLink
              to="/recycle-bin"
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors duration-150 group select-none border',
                  isActive
                    ? 'bg-lavender-accent/15 text-lavender-accent font-bold shadow-xs border-lavender-accent/25'
                    : 'text-ink-muted hover:text-ink hover:bg-surface border-transparent'
                )
              }
            >
              <div className="flex items-center gap-3 truncate">
                <TrashIcon size={18} className="text-ink-subtle flex-shrink-0" />
                <span className="truncate">Recycle Bin</span>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Footer & User Profile Row */}
        <div className="pt-4 border-t border-glass-border-subtle">
          <div className="flex items-center justify-between p-2 rounded-2xl bg-surface/60 border border-glass-border-subtle">
            <div className="flex items-center gap-2.5 min-w-0">
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
                  {authorizedUser?.display_name || 'Authorized'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle size="sm" />
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="p-1.5 rounded-xl text-ink-muted hover:text-rose-500 hover:bg-surface-elevated transition-colors"
                title="Log Out"
              >
                <LogOutIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* New Folder Modal */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />

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
