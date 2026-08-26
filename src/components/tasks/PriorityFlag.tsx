import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface PriorityFlagProps {
  priority: number
  showLabel?: boolean
  className?: string
}

export const PriorityFlag: React.FC<PriorityFlagProps> = ({
  priority,
  showLabel = false,
  className,
}) => {
  if (priority <= 0) return null

  const getPriorityInfo = () => {
    switch (priority) {
      case 1:
        return {
          label: 'Low',
          dotClass: 'bg-blossom-400',
          bgClass: 'bg-blossom-50 border-blossom-200 text-blossom-600',
          isUrgent: false,
        }
      case 2:
        return {
          label: 'Medium',
          dotClass: 'bg-skyblue-600',
          bgClass: 'bg-skyblue-50 border-skyblue-200 text-skyblue-600',
          isUrgent: false,
        }
      case 3:
      default:
        return {
          label: 'Urgent',
          dotClass: 'bg-lavender-600',
          bgClass: 'bg-lavender-50 border-lavender-200 text-lavender-600',
          isUrgent: true,
        }
    }
  }

  const { label, dotClass, bgClass, isUrgent } = getPriorityInfo()

  if (showLabel) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs',
          bgClass,
          className
        )}
      >
        <span className="relative flex h-2 w-2">
          {isUrgent && (
            <motion.span
              animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className={cn('absolute inline-flex h-full w-full rounded-full opacity-75', dotClass)}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', dotClass)} />
        </span>
        {label}
      </span>
    )
  }

  return (
    <div className={cn('relative flex items-center justify-center h-4 w-4', className)} title={`Priority: ${label}`}>
      {isUrgent && (
        <motion.span
          animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className={cn('absolute inline-flex h-2.5 w-2.5 rounded-full opacity-75', dotClass)}
        />
      )}
      <span className={cn('relative inline-flex rounded-full h-2 w-2', dotClass)} />
    </div>
  )
}
