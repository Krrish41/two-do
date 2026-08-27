import React from 'react'
import {
  FolderIcon,
  BriefcaseIcon,
  HomeIcon,
  PlaneIcon,
  PaletteIcon,
  LightbulbIcon,
  BookOpenIcon,
  TargetIcon,
  SparklesIcon,
  CodeIcon,
  HeartIcon,
  StarIcon,
  CompassIcon,
  MusicIcon,
  TagIcon,
} from '../icons'
import { cn } from '../../lib/utils'

export interface FolderIconOption {
  id: string
  label: string
  icon: React.FC<{ size?: number | string; className?: string }>
  color: string
}

export const FOLDER_ICON_OPTIONS: FolderIconOption[] = [
  { id: 'folder', label: 'Folder', icon: FolderIcon, color: 'text-amber-500' },
  { id: 'briefcase', label: 'Work', icon: BriefcaseIcon, color: 'text-orange-500' },
  { id: 'home', label: 'Home', icon: HomeIcon, color: 'text-emerald-500' },
  { id: 'plane', label: 'Travel', icon: PlaneIcon, color: 'text-sky-500' },
  { id: 'palette', label: 'Design', icon: PaletteIcon, color: 'text-pink-500' },
  { id: 'lightbulb', label: 'Ideas', icon: LightbulbIcon, color: 'text-amber-400' },
  { id: 'book', label: 'Reading', icon: BookOpenIcon, color: 'text-indigo-400' },
  { id: 'target', label: 'Goals', icon: TargetIcon, color: 'text-rose-500' },
  { id: 'sparkles', label: 'Special', icon: SparklesIcon, color: 'text-lavender-accent' },
  { id: 'code', label: 'Code', icon: CodeIcon, color: 'text-teal-400' },
  { id: 'star', label: 'Star', icon: StarIcon, color: 'text-yellow-500' },
  { id: 'music', label: 'Music', icon: MusicIcon, color: 'text-purple-400' },
]

export interface FolderIconRendererProps {
  icon?: string | null
  size?: number | string
  className?: string
  defaultColor?: string
}

export const FolderIconRenderer: React.FC<FolderIconRendererProps> = ({
  icon,
  size = 18,
  className = '',
  defaultColor,
}) => {
  const normalized = (icon || 'folder').toLowerCase().trim()

  // Match icon by ID or legacy emoji
  if (normalized === 'briefcase' || normalized === '💼' || normalized === 'work') {
    return <BriefcaseIcon size={size} className={cn(defaultColor || 'text-orange-500', className)} />
  }
  if (normalized === 'home' || normalized === '🏡' || normalized === 'house') {
    return <HomeIcon size={size} className={cn(defaultColor || 'text-emerald-500', className)} />
  }
  if (normalized === 'plane' || normalized === '✈️' || normalized === '✈' || normalized === 'travel') {
    return <PlaneIcon size={size} className={cn(defaultColor || 'text-sky-500', className)} />
  }
  if (normalized === 'palette' || normalized === '🎨' || normalized === 'art' || normalized === 'design') {
    return <PaletteIcon size={size} className={cn(defaultColor || 'text-pink-500', className)} />
  }
  if (normalized === 'lightbulb' || normalized === '💡' || normalized === 'ideas') {
    return <LightbulbIcon size={size} className={cn(defaultColor || 'text-amber-400', className)} />
  }
  if (normalized === 'book' || normalized === 'books' || normalized === '📚' || normalized === 'reading') {
    return <BookOpenIcon size={size} className={cn(defaultColor || 'text-indigo-400', className)} />
  }
  if (normalized === 'target' || normalized === '🎯' || normalized === 'goals') {
    return <TargetIcon size={size} className={cn(defaultColor || 'text-rose-500', className)} />
  }
  if (normalized === 'sparkles' || normalized === '✨' || normalized === 'special') {
    return <SparklesIcon size={size} className={cn(defaultColor || 'text-lavender-accent', className)} />
  }
  if (normalized === 'code' || normalized === '💻' || normalized === 'dev') {
    return <CodeIcon size={size} className={cn(defaultColor || 'text-teal-400', className)} />
  }
  if (normalized === 'heart' || normalized === '❤️' || normalized === '💖' || normalized === 'love') {
    return <HeartIcon size={size} className={cn(defaultColor || 'text-rose-400', className)} />
  }
  if (normalized === 'star' || normalized === '⭐' || normalized === 'starred') {
    return <StarIcon size={size} className={cn(defaultColor || 'text-yellow-500', className)} />
  }
  if (normalized === 'compass' || normalized === '🧭') {
    return <CompassIcon size={size} className={cn(defaultColor || 'text-cyan-500', className)} />
  }
  if (normalized === 'music' || normalized === '🎵') {
    return <MusicIcon size={size} className={cn(defaultColor || 'text-purple-400', className)} />
  }
  if (normalized === 'tag' || normalized === '🏷️' || normalized === '🏷') {
    return <TagIcon size={size} className={cn(defaultColor || 'text-lavender-accent', className)} />
  }

  // Fallback default folder icon
  return <FolderIcon size={size} className={cn(defaultColor || 'text-amber-500', className)} />
}
