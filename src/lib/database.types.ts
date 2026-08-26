export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      authorized_users: {
        Row: {
          id: string
          display_name: string
          accent_color: string
        }
        Insert: {
          id: string
          display_name: string
          accent_color?: string
        }
        Update: {
          id?: string
          display_name?: string
          accent_color?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          id: string
          name: string
          slug: string | null
          parent_folder_id: string | null
          color: string
          icon: string
          is_system: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          parent_folder_id?: string | null
          color?: string
          icon?: string
          is_system?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          parent_folder_id?: string | null
          color?: string
          icon?: string
          is_system?: boolean
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "authorized_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          notes: string | null
          parent_task_id: string | null
          folder_id: string | null
          due_date: string | null
          is_my_day_date: string | null
          priority: number
          is_completed: boolean
          completed_at: string | null
          recurrence_rule: string | null
          position: number
          created_by: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          notes?: string | null
          parent_task_id?: string | null
          folder_id?: string | null
          due_date?: string | null
          is_my_day_date?: string | null
          priority?: number
          is_completed?: boolean
          completed_at?: string | null
          recurrence_rule?: string | null
          position?: number
          created_by?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          notes?: string | null
          parent_task_id?: string | null
          folder_id?: string | null
          due_date?: string | null
          is_my_day_date?: string | null
          priority?: number
          is_completed?: boolean
          completed_at?: string | null
          recurrence_rule?: string | null
          position?: number
          created_by?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "authorized_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "authorized_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      notes: {
        Row: {
          id: string
          title: string
          content: Json
          color: string
          folder_id: string | null
          is_pinned: boolean
          deleted_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string
          content?: Json
          color?: string
          folder_id?: string | null
          is_pinned?: boolean
          deleted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: Json
          color?: string
          folder_id?: string | null
          is_pinned?: boolean
          deleted_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "authorized_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          }
        ]
      }
      note_tags: {
        Row: {
          note_id: string
          tag_id: string
        }
        Insert: {
          note_id: string
          tag_id: string
        }
        Update: {
          note_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_authorized: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type AuthorizedUser = Database['public']['Tables']['authorized_users']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type Folder = Database['public']['Tables']['folders']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type NoteTag = Database['public']['Tables']['note_tags']['Row']
