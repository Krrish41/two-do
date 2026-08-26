import {
  Sun,
  CheckCircle2,
  Flame,
  StickyNote,
  CheckCheck,
  Heart,
  Trash2,
  Folder as FolderIcon,
  Tag,
  Calendar,
  Repeat,
  Plus,
  Search,
  Pin,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ArrowUpDown,
  Filter,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  Menu,
  LogOut,
  GripVertical,
  LayoutGrid,
  List as ListIcon,
  type LucideIcon,
} from 'lucide-react'

export interface IconConcept {
  icon: LucideIcon
  emoji?: string
  label: string
  colorClass: string
}

export const APP_ICONS = {
  // Views
  views: {
    myDay: { icon: Sun, label: 'My Day', colorClass: 'text-amber-500', emoji: '☀️' },
    allTasks: { icon: CheckCircle2, label: 'All Tasks', colorClass: 'text-lavender-accent', emoji: '✅' },
    important: { icon: Flame, label: 'Important', colorClass: 'text-rose-500', emoji: '🔥' },
    notes: { icon: StickyNote, label: 'Notes & Memos', colorClass: 'text-skyblue-accent', emoji: '📝' },
    completed: { icon: CheckCheck, label: 'Completed', colorClass: 'text-emerald-500', emoji: '✅' },
    bucketList: { icon: Heart, label: 'Bucket List', colorClass: 'text-blossom-accent', emoji: '💕' },
    recycleBin: { icon: Trash2, label: 'Recycle Bin', colorClass: 'text-ink-muted', emoji: '🗑️' },
  },

  // Priority Levels
  priorities: {
    p0: { label: 'P0 - None', shortLabel: 'P0', colorClass: 'text-ink-muted' },
    p1: { label: 'P1 - Low', shortLabel: 'P1', colorClass: 'text-skyblue-accent' },
    p2: { label: 'P2 - Medium', shortLabel: 'P2', colorClass: 'text-amber-accent' },
    p3: { label: 'P3 - Urgent', shortLabel: 'P3', colorClass: 'text-rose-500' },
  },

  // Common UI Actions & Entities
  common: {
    folder: FolderIcon,
    tag: Tag,
    calendar: Calendar,
    repeat: Repeat,
    plus: Plus,
    search: Search,
    pin: Pin,
    lock: Lock,
    mail: Mail,
    arrowRight: ArrowRight,
    sparkles: Sparkles,
    sort: ArrowUpDown,
    filter: Filter,
    close: X,
    restore: RotateCcw,
    check: Check,
    alert: AlertCircle,
    menu: Menu,
    logout: LogOut,
    grip: GripVertical,
    grid: LayoutGrid,
    list: ListIcon,
  },
} as const
