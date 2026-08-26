import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { Note, Folder, Tag, NoteTag, Json } from '../lib/database.types'
import { useAuthStore } from './authStore'

export const NOTE_COLOR_PRESETS = [
  { id: 'lavender', hex: '#E4DBF7', name: 'Lavender', textClass: 'text-purple-900', darkBg: 'rgba(196, 174, 240, 0.15)' },
  { id: 'skyblue', hex: '#D6E8FF', name: 'Soft Blue', textClass: 'text-blue-900', darkBg: 'rgba(167, 199, 231, 0.15)' },
  { id: 'blossom', hex: '#FBDDEA', name: 'Rose Pink', textClass: 'text-pink-900', darkBg: 'rgba(245, 169, 201, 0.15)' },
  { id: 'mint', hex: '#D9F5E3', name: 'Mint Glow', textClass: 'text-emerald-900', darkBg: 'rgba(94, 217, 158, 0.15)' },
  { id: 'clear', hex: 'rgba(255,255,255,0.4)', name: 'Glass Clear', textClass: 'text-ink', darkBg: 'rgba(255,255,255,0.07)' },
] as const

export type NoteViewMode = 'grid' | 'list'

interface NoteState {
  notes: Note[]
  folders: Folder[]
  tags: Tag[]
  noteTags: NoteTag[]
  loading: boolean
  selectedNoteId: string | null
  selectedFolderId: string | null
  selectedTagIds: string[]
  searchQuery: string
  viewMode: NoteViewMode

  // Actions
  fetchNotes: () => Promise<void>
  addNote: (params?: {
    title?: string
    content?: Json
    color?: string
    folder_id?: string | null
    is_pinned?: boolean
  }) => Promise<Note | null>
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>
  softDeleteNote: (id: string) => Promise<void>
  restoreNote: (id: string) => Promise<void>
  deleteForeverNote: (id: string) => Promise<void>
  emptyRecycleBin: () => Promise<void>
  togglePin: (id: string) => Promise<void>
  createFolder: (name: string, icon?: string, color?: string, parentFolderId?: string | null) => Promise<Folder | null>
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  createTag: (name: string, color?: string) => Promise<Tag | null>
  toggleNoteTag: (noteId: string, tagId: string) => Promise<void>
  extractAndSyncTags: (noteId: string, plainText: string) => Promise<void>
  setSelectedNoteId: (id: string | null) => void
  setSelectedFolderId: (id: string | null) => void
  toggleTagFilter: (tagId: string) => void
  clearTagFilters: () => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: NoteViewMode) => void
  receiveRealtimeNote: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: Note | null
    old: { id: string } | null
  }) => void
  receiveRealtimeFolder: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: Folder | null
    old: { id: string } | null
  }) => void
}

const INITIAL_DEMO_FOLDERS: Folder[] = [
  {
    id: 'folder-bucket-list',
    name: 'Bucket List',
    slug: 'bucket-list',
    parent_folder_id: null,
    color: '#E86FA0',
    icon: '💕',
    is_system: true,
    created_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'folder-work',
    name: 'Projects',
    slug: null,
    parent_folder_id: null,
    color: '#9B7EDC',
    icon: '🚀',
    is_system: false,
    created_by: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'folder-personal',
    name: 'Personal & Ideas',
    slug: null,
    parent_folder_id: null,
    color: '#6FA8DC',
    icon: '✨',
    is_system: false,
    created_by: null,
    created_at: new Date().toISOString(),
  },
]

const INITIAL_DEMO_NOTES: Note[] = [
  {
    id: 'demo-note-1',
    title: 'Two-Do v2 Features & Specs #roadmap #design',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Welcome to Two-Do v2! Redesigned with custom CSS variable dark mode, multi-level color-coded folders, and pastel glass notes.' },
          ],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Two-orb gradient logo rebrand' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Soft-delete Recycle Bin with restore' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Auto hashtag extraction #tags' }] }],
            },
          ],
        },
      ],
    },
    color: '#E4DBF7',
    folder_id: 'folder-work',
    is_pinned: true,
    deleted_at: null,
    created_by: 'demo-user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-note-2',
    title: 'Weekend Getaway & Stargazing #bucketlist',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Cozy cabin trip with hot cocoa, telescope stargazing, and polaroid photos.' }],
        },
      ],
    },
    color: '#D6E8FF',
    folder_id: 'folder-bucket-list',
    is_pinned: true,
    deleted_at: null,
    created_by: 'demo-user-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const INITIAL_DEMO_TAGS: Tag[] = [
  { id: 'tag-1', name: 'roadmap', color: '#B79CF0' },
  { id: 'tag-2', name: 'design', color: '#8FC1F0' },
  { id: 'tag-3', name: 'bucketlist', color: '#F4A0C6' },
]

const INITIAL_DEMO_NOTE_TAGS: NoteTag[] = [
  { note_id: 'demo-note-1', tag_id: 'tag-1' },
  { note_id: 'demo-note-1', tag_id: 'tag-2' },
  { note_id: 'demo-note-2', tag_id: 'tag-3' },
]

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  folders: [],
  tags: [],
  noteTags: [],
  loading: false,
  selectedNoteId: null,
  selectedFolderId: null,
  selectedTagIds: [],
  searchQuery: '',
  viewMode: (typeof window !== 'undefined' ? (localStorage.getItem('two_do_note_view_mode') as NoteViewMode) : null) || 'grid',

  fetchNotes: async () => {
    set({ loading: true })

    if (!isSupabaseConfigured) {
      if (get().notes.length === 0) {
        set({
          notes: INITIAL_DEMO_NOTES,
          folders: INITIAL_DEMO_FOLDERS,
          tags: INITIAL_DEMO_TAGS,
          noteTags: INITIAL_DEMO_NOTE_TAGS,
          loading: false,
        })
      } else {
        set({ loading: false })
      }
      return
    }

    try {
      const [notesRes, foldersRes, tagsRes, noteTagsRes] = await Promise.all([
        supabase.from('notes').select('*').order('created_at', { ascending: false }),
        supabase.from('folders').select('*').order('name', { ascending: true }),
        supabase.from('tags').select('*').order('name', { ascending: true }),
        supabase.from('note_tags').select('*'),
      ])

      if (notesRes.error) throw notesRes.error
      if (foldersRes.error) throw foldersRes.error
      if (tagsRes.error) throw tagsRes.error
      if (noteTagsRes.error) throw noteTagsRes.error

      set({
        notes: notesRes.data || [],
        folders: foldersRes.data || [],
        tags: tagsRes.data || [],
        noteTags: noteTagsRes.data || [],
      })
    } catch (err) {
      console.error('Failed to fetch notes data:', err)
    } finally {
      set({ loading: false })
    }
  },

  addNote: async (params) => {
    const authUser = useAuthStore.getState().authorizedUser
    const currentNotes = get().notes

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: params?.title || 'Untitled Note',
      content: params?.content || {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      },
      color: params?.color || NOTE_COLOR_PRESETS[0].hex,
      folder_id: params?.folder_id || get().selectedFolderId,
      is_pinned: params?.is_pinned || false,
      deleted_at: null,
      created_by: authUser?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    set({
      notes: [newNote, ...currentNotes],
      selectedNoteId: newNote.id,
    })

    if (!isSupabaseConfigured) return newNote

    const isUUID = (val: string | null | undefined) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

    const safeFolderId = isUUID(newNote.folder_id) ? newNote.folder_id : null

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          id: newNote.id,
          title: newNote.title,
          content: newNote.content,
          color: newNote.color,
          folder_id: safeFolderId,
          is_pinned: newNote.is_pinned,
          deleted_at: null,
          created_by: newNote.created_by,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        set({
          notes: get().notes.map((n) => (n.id === newNote.id ? data : n)),
        })
        return data
      }
    } catch (err) {
      console.error('Failed to create note:', err)
      set({ notes: currentNotes })
      return null
    }

    return newNote
  },

  updateNote: async (id, updates) => {
    const prevNotes = get().notes
    const updated = prevNotes.map((n) =>
      n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
    )

    set({ notes: updated })

    if (!isSupabaseConfigured) return

    try {
      const { error } = await supabase.from('notes').update(updates).eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('Failed to update note:', err)
      set({ notes: prevNotes })
    }
  },

  softDeleteNote: async (id) => {
    await get().updateNote(id, { deleted_at: new Date().toISOString() })
    if (get().selectedNoteId === id) {
      set({ selectedNoteId: null })
    }
  },

  restoreNote: async (id) => {
    await get().updateNote(id, { deleted_at: null })
  },

  deleteForeverNote: async (id) => {
    const prevNotes = get().notes
    set({
      notes: prevNotes.filter((n) => n.id !== id),
      selectedNoteId: get().selectedNoteId === id ? null : get().selectedNoteId,
    })

    if (!isSupabaseConfigured) return

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('Failed to permanently delete note:', err)
      set({ notes: prevNotes })
    }
  },

  emptyRecycleBin: async () => {
    const deletedNoteIds = get().notes.filter((n) => n.deleted_at !== null).map((n) => n.id)
    if (deletedNoteIds.length === 0) return

    const prevNotes = get().notes
    set({ notes: prevNotes.filter((n) => n.deleted_at === null) })

    if (!isSupabaseConfigured) return

    try {
      await supabase.from('notes').delete().in('id', deletedNoteIds)
    } catch (err) {
      console.error('Failed to empty recycle bin:', err)
      set({ notes: prevNotes })
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return
    await get().updateNote(id, { is_pinned: !note.is_pinned })
  },

  createFolder: async (name, icon = '📁', color = '#C4AEF0', parentFolderId = null) => {
    const authUser = useAuthStore.getState().authorizedUser
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: name.trim(),
      slug: null,
      parent_folder_id: parentFolderId,
      color,
      icon,
      is_system: false,
      created_by: authUser?.id || null,
      created_at: new Date().toISOString(),
    }

    set({ folders: [...get().folders, newFolder] })

    if (!isSupabaseConfigured) return newFolder

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({
          id: newFolder.id,
          name: newFolder.name,
          parent_folder_id: newFolder.parent_folder_id,
          color: newFolder.color,
          icon: newFolder.icon,
          is_system: false,
          created_by: newFolder.created_by,
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        set({
          folders: get().folders.map((f) => (f.id === newFolder.id ? data : f)),
        })
        return data
      }
    } catch (err) {
      console.error('Failed to create folder:', err)
    }
    return newFolder
  },

  updateFolder: async (id, updates) => {
    const folder = get().folders.find((f) => f.id === id)
    if (folder?.is_system) return // Prevent editing system folders like Bucket List

    set({
      folders: get().folders.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })

    if (!isSupabaseConfigured) return

    try {
      await supabase.from('folders').update(updates).eq('id', id)
    } catch (err) {
      console.error('Failed to update folder:', err)
    }
  },

  deleteFolder: async (id) => {
    const folder = get().folders.find((f) => f.id === id)
    if (folder?.is_system) return // Prevent deleting system folders like Bucket List

    set({
      folders: get().folders.filter((f) => f.id !== id && f.parent_folder_id !== id),
      selectedFolderId: get().selectedFolderId === id ? null : get().selectedFolderId,
    })

    if (!isSupabaseConfigured) return

    try {
      await supabase.from('folders').delete().eq('id', id)
    } catch (err) {
      console.error('Failed to delete folder:', err)
    }
  },

  createTag: async (name, color = '#A7C7E7') => {
    const cleanName = name.trim().replace(/^#/, '').toLowerCase()
    const existing = get().tags.find((t) => t.name.toLowerCase() === cleanName)
    if (existing) return existing

    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: cleanName,
      color,
    }

    set({ tags: [...get().tags, newTag] })

    if (!isSupabaseConfigured) return newTag

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({ id: newTag.id, name: newTag.name, color: newTag.color })
        .select()
        .single()

      if (error) throw error
      if (data) {
        set({
          tags: get().tags.map((t) => (t.id === newTag.id ? data : t)),
        })
        return data
      }
    } catch (err) {
      console.error('Failed to create tag:', err)
    }
    return newTag
  },

  toggleNoteTag: async (noteId, tagId) => {
    const current = get().noteTags
    const exists = current.some((nt) => nt.note_id === noteId && nt.tag_id === tagId)

    if (exists) {
      set({
        noteTags: current.filter((nt) => !(nt.note_id === noteId && nt.tag_id === tagId)),
      })
      if (isSupabaseConfigured) {
        await supabase.from('note_tags').delete().match({ note_id: noteId, tag_id: tagId })
      }
    } else {
      const newAssociation: NoteTag = { note_id: noteId, tag_id: tagId }
      set({ noteTags: [...current, newAssociation] })
      if (isSupabaseConfigured) {
        await supabase.from('note_tags').insert(newAssociation)
      }
    }
  },

  // Auto-extract #hashtags from text and link them
  extractAndSyncTags: async (noteId, plainText) => {
    if (!plainText) return
    const matches = plainText.match(/#([a-zA-Z0-9_-]+)/g)
    if (!matches) return

    const tagNames = [...new Set(matches.map((m) => m.slice(1).toLowerCase()))]
    for (const tagName of tagNames) {
      const tag = await get().createTag(tagName)
      if (tag) {
        const alreadyLinked = get().noteTags.some((nt) => nt.note_id === noteId && nt.tag_id === tag.id)
        if (!alreadyLinked) {
          await get().toggleNoteTag(noteId, tag.id)
        }
      }
    }
  },

  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  toggleTagFilter: (tagId) => {
    const current = get().selectedTagIds
    if (current.includes(tagId)) {
      set({ selectedTagIds: current.filter((id) => id !== tagId) })
    } else {
      set({ selectedTagIds: [...current, tagId] })
    }
  },
  clearTagFilters: () => set({ selectedTagIds: [] }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('two_do_note_view_mode', mode)
    }
    set({ viewMode: mode })
  },

  receiveRealtimeNote: ({ eventType, new: newRecord, old: oldRecord }) => {
    const currentNotes = get().notes
    if (eventType === 'INSERT' && newRecord) {
      if (!currentNotes.some((n) => n.id === newRecord.id)) {
        set({ notes: [newRecord, ...currentNotes] })
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      set({
        notes: currentNotes.map((n) => (n.id === newRecord.id ? newRecord : n)),
      })
    } else if (eventType === 'DELETE' && oldRecord) {
      set({
        notes: currentNotes.filter((n) => n.id !== oldRecord.id),
      })
    }
  },

  receiveRealtimeFolder: ({ eventType, new: newRecord, old: oldRecord }) => {
    const current = get().folders
    if (eventType === 'INSERT' && newRecord) {
      if (!current.some((f) => f.id === newRecord.id)) {
        set({ folders: [...current, newRecord] })
      }
    } else if (eventType === 'UPDATE' && newRecord) {
      set({
        folders: current.map((f) => (f.id === newRecord.id ? newRecord : f)),
      })
    } else if (eventType === 'DELETE' && oldRecord) {
      set({
        folders: current.filter((f) => f.id !== oldRecord.id),
      })
    }
  },
}))
