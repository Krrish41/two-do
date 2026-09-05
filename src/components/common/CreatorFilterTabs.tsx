import React from 'react'
import { motion } from 'framer-motion'
import { CoupleAvatar } from './CoupleAvatar'
import { useAuthStore } from '../../stores/authStore'
import { cn } from '../../lib/utils'

export interface CreatorFilterTabsProps {
  value: 'all' | 'mine' | 'partner'
  onChange: (val: 'all' | 'mine' | 'partner') => void
  allLabel?: string
  layoutId?: string
  className?: string
  fullWidth?: boolean
}

export const CreatorFilterTabs: React.FC<CreatorFilterTabsProps> = ({
  value,
  onChange,
  allLabel = 'All Tasks',
  layoutId = 'creator-filter-bubble',
  className,
  fullWidth = false,
}) => {
  const authorizedUser = useAuthStore((s) => s.authorizedUser)
  const partnerUser = useAuthStore((s) => s.partnerUser)

  const items = [
    { id: 'all' as const, label: allLabel, avatar: null },
    ...(authorizedUser
      ? [
          {
            id: 'mine' as const,
            label: authorizedUser.display_name,
            avatar: (
              <CoupleAvatar
                userId={authorizedUser.id}
                displayName={authorizedUser.display_name}
                size={16}
                className="flex-shrink-0"
              />
            ),
          },
        ]
      : []),
    ...(partnerUser
      ? [
          {
            id: 'partner' as const,
            label: partnerUser.display_name,
            avatar: (
              <CoupleAvatar
                userId={partnerUser.id}
                displayName={partnerUser.display_name}
                size={16}
                className="flex-shrink-0"
              />
            ),
          },
        ]
      : []),
  ]

  return (
    <div
      className={cn(
        'relative inline-flex items-center gap-1 p-1 rounded-[22px] bg-slate-200/75 dark:bg-white/[0.05] backdrop-blur-xl border border-black/5 dark:border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] max-w-full overflow-x-auto scrollbar-none select-none',
        fullWidth && 'w-full flex justify-between',
        className
      )}
    >
      {items.map((item) => {
        const isSelected = value === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              'relative h-8 px-2.5 sm:px-3.5 rounded-[18px] text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer focus:outline-none select-none',
              fullWidth && 'flex-1 text-center min-w-0 px-1 sm:px-3',
              isSelected ? 'text-ink font-extrabold' : 'text-ink-muted hover:text-ink font-semibold'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-[18px] bg-white dark:bg-white/[0.14] backdrop-blur-md border border-white/80 dark:border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.22)]"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5 leading-none">
              {item.avatar}
              <span>{item.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
