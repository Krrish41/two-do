import React from 'react'
import { Repeat } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface RecurrenceIconProps {
  rule: string | null | undefined
  className?: string
  showText?: boolean
}

export const RecurrenceIcon: React.FC<RecurrenceIconProps> = ({
  rule,
  className,
  showText = false,
}) => {
  if (!rule) return null

  const getFormat = (r: string) => {
    switch (r.toUpperCase()) {
      case 'DAILY':
        return 'Daily'
      case 'WEEKLY':
        return 'Weekly'
      case 'MONTHLY':
        return 'Monthly'
      default:
        return r
    }
  }

  const text = getFormat(rule)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs text-lavender-600 bg-lavender-50/80 px-2 py-0.5 rounded-md border border-lavender-200/60 font-medium',
        className
      )}
      title={`Repeats: ${text}`}
    >
      <Repeat className="w-3 h-3 stroke-[2.2]" />
      {showText && <span>{text}</span>}
    </span>
  )
}
