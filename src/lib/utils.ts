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

export function getTodayDateString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isToday(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const localToday = getTodayDateString()
  const isoToday = new Date().toISOString().split('T')[0]
  return dateString.startsWith(localToday) || dateString.startsWith(isoToday)
}
