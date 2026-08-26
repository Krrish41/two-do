import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, CheckIcon } from '../icons'
import { cn } from '../../lib/utils'

export interface DropdownOption<T = string> {
  value: T
  label: string
  icon?: React.ReactNode | string
  color?: string
}

export interface GlassDropdownProps<T = string> {
  options: DropdownOption<T>[]
  value: T
  onChange: (value: T) => void
  placeholder?: string
  icon?: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function GlassDropdown<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  icon,
  className,
  size = 'sm',
  disabled = false,
}: GlassDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-2 min-h-[32px]',
    md: 'px-3.5 py-2 text-xs sm:text-sm rounded-2xl gap-2.5 min-h-[40px]',
  }[size]

  return (
    <div ref={dropdownRef} className={cn('relative inline-block text-left select-none', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between font-semibold transition-all duration-200 border',
          'bg-surface hover:bg-surface-elevated text-ink border-glass-border shadow-xs',
          isOpen && 'ring-2 ring-lavender-accent/30 border-lavender-accent',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeClasses
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-ink-muted flex-shrink-0">{icon}</span>}
          {selectedOption ? (
            <div className="flex items-center gap-1.5 truncate">
              {selectedOption.icon && (
                <span className="flex-shrink-0">{selectedOption.icon}</span>
              )}
              <span className="truncate">{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-ink-muted font-normal">{placeholder}</span>
          )}
        </div>

        <ChevronDownIcon
          size={14}
          className={cn(
            'text-ink-muted flex-shrink-0 transition-transform duration-200 ml-1.5',
            isOpen && 'rotate-180 text-lavender-accent'
          )}
        />
      </button>

      {/* Glass Panel Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 min-w-[180px] max-h-60 overflow-y-auto bg-white dark:bg-[#1B152B] p-1.5 rounded-2xl shadow-2xl border border-glass-border flex flex-col gap-0.5"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors text-left',
                    isSelected
                      ? 'bg-lavender-accent/15 text-lavender-accent'
                      : 'text-ink-muted hover:text-ink hover:bg-surface'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <CheckIcon size={14} className="text-lavender-accent flex-shrink-0 ml-2" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
