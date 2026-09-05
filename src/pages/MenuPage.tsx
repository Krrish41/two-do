import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FlameIcon,
  CheckCheckIcon,
  TrashIcon,
  PlusIcon,
  LogOutIcon,
} from '../components/icons'
import { SlidersHorizontal } from 'lucide-react'
import { CoupleAvatar } from '../components/common/CoupleAvatar'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { FolderIconRenderer } from '../components/common/FolderIconRenderer'
import { CreateFolderModal } from '../components/common/CreateFolderModal'
import { ManageTagsModal } from '../components/notes/ManageTagsModal'
import { GlassConfirmDialog } from '../components/glass/GlassConfirmDialog'
import { useTaskStore } from '../stores/taskStore'
import { useNoteStore } from '../stores/noteStore'
import { useAuthStore } from '../stores/authStore'
import { cn } from '../lib/utils'
import { CollapsingHeader } from '../components/layout/CollapsingHeader'

export const MenuPage: React.FC = () => {
  const navigate = useNavigate()
  const tasks = useTaskStore((s) => s.tasks)
  const notes = useNoteStore((s) => s.notes)
  const folders = useNoteStore((s) => s.folders)
  const tags = useNoteStore((s) => s.tags)
  const noteTags = useNoteStore((s) => s.noteTags)
  const deleteFolder = useNoteStore((s) => s.deleteFolder)
  const deleteTag = useNoteStore((s) => s.deleteTag)
  const toggleTagFilter = useNoteStore((s) => s.toggleTagFilter)

  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const session = useAuthStore((s) => s.session)
  const signOut = useAuthStore((s) => s.signOut)

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string } | null>(null)
  const [tagToDelete, setTagToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)

  // Counts for views not in primary 4 tabs
  const importantCount = tasks.filter(
    (t) => t.priority >= 2 && !t.is_completed && t.deleted_at === null
  ).length

  const completedCount = tasks.filter(
    (t) => t.is_completed && t.deleted_at === null && !t.parent_task_id
  ).length

  const deletedTasksCount = tasks.filter((t) => t.deleted_at !== null).length
  const deletedNotesCount = notes.filter((n) => n.deleted_at !== null).length
  const totalTrashCount = deletedTasksCount + deletedNotesCount

  // Custom User Folders (excluding system folders like Bucket List)
  const customFolders = folders.filter((f) => !f.is_system && f.slug !== 'bucket-list')

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex flex-col max-w-xl mx-auto pb-32 sm:pb-16">
      {/* Mobile Collapsing Large-Title Header (<768px) */}
      <CollapsingHeader title="Menu" />

      {/* Main Page Content */}
      <div className="flex flex-col gap-3.5 sm:gap-5 px-3.5 sm:px-0 pt-1 sm:pt-0">
        {/* Menu Header (desktop only) */}
        <div className="hidden sm:block">
          <h1 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">Menu</h1>
          <p className="text-xs text-ink-muted mt-0.5">Views, folders, tags, and settings</p>
        </div>

      {/* 1. Filtered Views Section (Only items not in 4 primary bottom tabs) */}
      <div className="flex flex-col gap-2">
        <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
          Filtered Views
        </span>

        <div className="flex flex-col gap-2">
          {/* Important */}
          <NavLink
            to="/important"
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 border select-none group',
                isActive
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                  : 'bg-surface/80 hover:bg-surface-elevated border-glass-border text-ink'
              )
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-500">
                <FlameIcon size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-semibold">Important</span>
            </div>
            {importantCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                {importantCount}
              </span>
            )}
          </NavLink>

          {/* Completed */}
          <NavLink
            to="/completed"
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 border select-none group',
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'bg-surface/80 hover:bg-surface-elevated border-glass-border text-ink'
              )
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                <CheckCheckIcon size={18} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-sm font-semibold">Completed</span>
            </div>
            {completedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-subtle text-ink-muted">
                {completedCount}
              </span>
            )}
          </NavLink>
        </div>
      </div>

      {/* 2. Folders & Projects Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
            Folders & Projects
          </span>
          <button
            type="button"
            onClick={() => setIsFolderModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-lavender-accent hover:bg-lavender-accent/15 transition-colors border border-lavender-accent/20"
          >
            <PlusIcon size={13} />
            <span>New</span>
          </button>
        </div>

        {customFolders.length === 0 ? (
          <div className="p-5 rounded-2xl bg-surface/50 border border-glass-border text-center">
            <p className="text-xs text-ink-muted">
              No custom folders yet. Create folders to organize shared projects and lists.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {customFolders.map((folder) => {
              const folderTaskCount = tasks.filter(
                (t) => t.folder_id === folder.id && !t.is_completed && t.deleted_at === null
              ).length

              return (
                <div
                  key={folder.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-surface/80 hover:bg-surface-elevated border border-glass-border transition-colors group"
                >
                  <NavLink
                    to={`/folder/${folder.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-8 h-8 rounded-xl bg-surface-subtle flex items-center justify-center flex-shrink-0">
                      <FolderIconRenderer icon={folder.icon} size={18} />
                    </div>
                    <span className="text-sm font-semibold text-ink truncate">
                      {folder.name}
                    </span>
                  </NavLink>

                  <div className="flex items-center gap-2">
                    {folderTaskCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-subtle text-ink-muted">
                        {folderTaskCount}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setFolderToDelete({ id: folder.id, name: folder.name })}
                      className="p-1.5 rounded-lg text-ink-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-70 group-hover:opacity-100"
                      title="Delete Folder"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
            Tags
          </span>
          <div className="flex items-center gap-1.5">
            {tags.length > 0 && (
              <button
                type="button"
                onClick={() => setIsTagModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface transition-colors border border-glass-border"
                title="Manage and edit tags"
              >
                <SlidersHorizontal size={12} />
                <span>Manage</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsTagModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-lavender-accent hover:bg-lavender-accent/15 transition-colors border border-lavender-accent/20"
            >
              <PlusIcon size={13} />
              <span>New</span>
            </button>
          </div>
        </div>

        {tags.length === 0 ? (
          <div className="p-5 rounded-2xl bg-surface/50 border border-glass-border text-center">
            <p className="text-xs text-ink-muted">
              No tags created yet. Create tags to organize your notes with custom topics.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tags.map((tag) => {
              const taggedNotesCount = noteTags.filter((nt) => nt.tag_id === tag.id).length

              return (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-surface/80 hover:bg-surface-elevated border border-glass-border transition-colors group"
                >
                  <button
                    type="button"
                    onClick={() => {
                      toggleTagFilter(tag.id)
                      navigate('/notes')
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color || '#8B5CF6' }}
                    />
                    <span className="text-sm font-semibold text-ink truncate">
                      #{tag.name}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-subtle text-ink-muted">
                      {taggedNotesCount} {taggedNotesCount === 1 ? 'note' : 'notes'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setTagToDelete({ id: tag.id, name: tag.name })}
                      className="p-1.5 rounded-lg text-ink-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                      title="Delete Tag"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 3. Utilities Section (Recycle Bin) */}
      <div className="flex flex-col gap-2">
        <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
          Utilities
        </span>

        <NavLink
          to="/recycle-bin"
          className={({ isActive }) =>
            cn(
              'flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 border select-none group',
              isActive
                ? 'bg-surface-elevated border-glass-border text-ink font-bold shadow-xs'
                : 'bg-surface/80 hover:bg-surface-elevated border-glass-border text-ink'
            )
          }
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-subtle flex items-center justify-center text-ink-muted">
              <TrashIcon size={18} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-semibold">Recycle Bin</span>
          </div>
          {totalTrashCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
              {totalTrashCount}
            </span>
          )}
        </NavLink>
      </div>

      {/* 4. Account Row (Avatar, Name, Online Status, Single Mobile Theme Toggle, Sign Out) */}
      <div className="flex flex-col gap-1.5 mt-1">
        <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
          Account & Preferences
        </span>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-elevated/90 border border-glass-border shadow-xs">
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
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-ink truncate">
                  {authorizedUser?.display_name || 'Authorized User'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              </div>
              <span className="text-[11px] text-ink-muted truncate">
                {session?.user?.email || 'krrish4173@gmail.com'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* The ONLY theme toggle on mobile */}
            <ThemeToggle size="sm" />

            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="p-1.5 rounded-xl text-ink-muted hover:text-rose-500 hover:bg-rose-500/15 transition-colors border border-glass-border-subtle cursor-pointer"
              title="Sign Out"
            >
              <LogOutIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />

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

      <GlassConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="Sign Out?"
        description="Are you sure you want to log out of your shared workspace?"
        confirmText="Sign Out"
        variant="danger"
        onConfirm={() => {
          setIsLogoutConfirmOpen(false)
          handleSignOut()
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      {/* Manage Tags Modal */}
      <ManageTagsModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
      />

      {/* Delete Tag Confirmation Dialog */}
      <GlassConfirmDialog
        isOpen={Boolean(tagToDelete)}
        title={`Delete #${tagToDelete?.name || ''}?`}
        description={
          tagToDelete
            ? `Are you sure you want to delete #${tagToDelete.name}? It will be removed from all notes.`
            : ''
        }
        confirmText="Delete Tag"
        variant="danger"
        onConfirm={async () => {
          if (tagToDelete) {
            await deleteTag(tagToDelete.id)
            setTagToDelete(null)
          }
        }}
        onCancel={() => setTagToDelete(null)}
      />
      </div>
    </div>
  )
}
