import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function isToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const today = new Date().toISOString().split('T')[0]
  return dateString.startsWith(today)
}
