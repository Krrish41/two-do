import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import type { Note, Folder, Tag, NoteTag, Json } from '../lib/database.types'
import { useAuthStore } from './authStore'

export const NOTE_COLOR_PRESETS = [
  { id: 'lavender', hex: '#E4DBF7', name: 'Lavender', textClass: 'text-purple-900' },
  { id: 'skyblue', hex: '#D6E8FF', name: 'Sky Blue', textClass: 'text-blue-900' },
  { id: 'blossom', hex: '#FBDDEA', name: 'Blossom', textClass: 'text-pink-900' },
  { id: 'mint', hex: '#DCF3E6', name: 'Soft Mint', textClass: 'text-emerald-900' },
  { id: 'neutral', hex: '#F4F2EF', name: 'Alabaster', textClass: 'text-stone-900' },
] as const

interface NoteState {
  notes: Note[]
  folders: Folder[]
  tags: Tag[]
  noteTags: NoteTag[]
  loading: boolean
  selectedNoteId: string | null
  selectedFolderId: string | null
  selectedTagId: string | null
  searchQuery: string

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
  deleteNote: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  createFolder: (name: string, parentFolderId?: string | null) => Promise<Folder | null>
  deleteFolder: (id: string) => Promise<void>
  createTag: (name: string, color?: string) => Promise<Tag | null>
  toggleNoteTag: (noteId: string, tagId: string) => Promise<void>
  setSelectedNoteId: (id: string | null) => void
  setSelectedFolderId: (id: string | null) => void
  setSelectedTagId: (id: string | null) => void
  setSearchQuery: (query: string) => void
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

const INITIAL_DEMO_NOTES: Note[] = [
  {
    id: 'demo-note-1',
    title: 'Design Aesthetics & Glassmorphism Specs',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Welcome to Two-Do! This workspace is crafted with Apple Glassy aesthetics, subtle blur layers, and harmonious pastel tones.' },
          ],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '5 curated color presets' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rich-text formatting with Tiptap' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Realtime collaborative sync via Supabase' }] }],
            },
          ],
        },
      ],
    },
    color: '#E4DBF7',
    folder_id: null,
    is_pinned: true,
    created_by: 'demo-user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-note-2',
    title: 'Shared Project Ideas & Brainstorming',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Next big features to explore together:' }],
        },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Subtask deep hierarchies' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Shared calendar and date views' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Instant push notifications' }] }] },
          ],
        },
      ],
    },
    color: '#D6E8FF',
    folder_id: null,
    is_pinned: false,
    created_by: 'demo-user-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const INITIAL_DEMO_TAGS: Tag[] = [
  { id: 'tag-1', name: 'Work', color: '#A7C7E7' },
  { id: 'tag-2', name: 'Personal', color: '#F5A9C9' },
  { id: 'tag-3', name: 'Ideas', color: '#C4AEF0' },
]

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  folders: [],
  tags: [],
  noteTags: [],
  loading: false,
  selectedNoteId: null,
  selectedFolderId: null,
  selectedTagId: null,
  searchQuery: '',

  fetchNotes: async () => {
    set({ loading: true })

    if (!isSupabaseConfigured) {
      if (get().notes.length === 0) {
        set({
          notes: INITIAL_DEMO_NOTES,
          tags: INITIAL_DEMO_TAGS,
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
      created_by: authUser?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    set({
      notes: [newNote, ...currentNotes],
      selectedNoteId: newNote.id,
    })

    if (!isSupabaseConfigured) return newNote

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          id: newNote.id,
          title: newNote.title,
          content: newNote.content,
          color: newNote.color,
          folder_id: newNote.folder_id,
          is_pinned: newNote.is_pinned,
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

  deleteNote: async (id) => {
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
      console.error('Failed to delete note:', err)
      set({ notes: prevNotes })
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id)
    if (!note) return
    await get().updateNote(id, { is_pinned: !note.is_pinned })
  },

  createFolder: async (name, parentFolderId = null) => {
    const authUser = useAuthStore.getState().authorizedUser
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: name.trim(),
      parent_folder_id: parentFolderId,
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

  deleteFolder: async (id) => {
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
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: name.trim(),
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

  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  setSelectedTagId: (id) => set({ selectedTagId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

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
