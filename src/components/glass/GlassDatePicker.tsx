import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isToday,
  parseISO,
} from 'date-fns'
import { CalendarIcon, ChevronDownIcon, ChevronRightIcon, CloseIcon } from '../icons'
import { cn } from '../../lib/utils'

export interface GlassDatePickerProps {
  value?: string | null // 'YYYY-MM-DD'
  onChange: (date: string | null) => void
  placeholder?: string
  className?: string
  size?: 'sm' | 'md'
  disabled?: boolean
  align?: 'left' | 'right'
}

export const GlassDatePicker: React.FC<GlassDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Due Date',
  className,
  size = 'sm',
  disabled = false,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState<Date>(
    value ? parseISO(value) : new Date()
  )
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const selectedDate = value ? parseISO(value) : null

  // Generate calendar grid dates
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const rows: Date[][] = []
  let days: Date[] = []
  let day = startDate

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day)
      day = addDays(day, 1)
    }
    rows.push(days)
    days = []
  }

  const handleDateSelect = (d: Date) => {
    onChange(format(d, 'yyyy-MM-dd'))
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setIsOpen(false)
  }

  const formattedDisplay = selectedDate
    ? isToday(selectedDate)
      ? 'Today'
      : format(selectedDate, 'MMM d')
    : null

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-2 min-h-[32px]',
    md: 'px-3.5 py-2 text-xs sm:text-sm rounded-2xl gap-2.5 min-h-[40px]',
  }[size]

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left select-none', isOpen && 'z-50', className)}>
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
          <CalendarIcon size={14} className={cn('flex-shrink-0', selectedDate ? 'text-lavender-accent' : 'text-ink-muted')} />
          {formattedDisplay ? (
            <span className="text-ink font-semibold">{formattedDisplay}</span>
          ) : (
            <span className="text-ink-muted font-normal">{placeholder}</span>
          )}
        </div>

        {selectedDate ? (
          <span
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-surface text-ink-muted hover:text-ink transition-colors ml-1"
            title="Clear date"
          >
            <CloseIcon size={12} />
          </span>
        ) : (
          <ChevronDownIcon
            size={12}
            className={cn(
              'text-ink-muted flex-shrink-0 transition-transform duration-200 ml-1',
              isOpen && 'rotate-180 text-lavender-accent'
            )}
          />
        )}
      </button>

      {/* Glass Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={cn(
              'absolute top-full mt-2 z-[70] w-[275px] bg-surface-elevated/98 dark:bg-[#1E1630] backdrop-blur-2xl p-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.9)] border border-black/10 dark:border-white/15 flex flex-col gap-2.5',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-xl hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                title="Previous Month"
              >
                <ChevronDownIcon size={16} className="rotate-90" />
              </button>

              <span className="font-bold text-xs sm:text-sm text-ink tracking-tight">
                {format(currentMonth, 'MMMM yyyy')}
              </span>

              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-xl hover:bg-surface text-ink-muted hover:text-ink transition-colors"
                title="Next Month"
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>

            {/* Days of the Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-ink-subtle uppercase">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="flex flex-col gap-1">
              {rows.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-7 gap-1">
                  {row.map((d, dIdx) => {
                    const isSelected = selectedDate ? isSameDay(d, selectedDate) : false
                    const isCurrentMonth = isSameMonth(d, currentMonth)
                    const isTodayDate = isToday(d)

                    return (
                      <button
                        key={dIdx}
                        type="button"
                        onClick={() => handleDateSelect(d)}
                        className={cn(
                          'w-8 h-8 rounded-xl text-xs font-semibold flex items-center justify-center transition-all',
                          !isCurrentMonth && 'opacity-25 pointer-events-none',
                          isSelected
                            ? 'bg-lavender-accent text-white shadow-sm font-bold scale-105'
                            : isTodayDate
                            ? 'border border-lavender-accent text-lavender-accent font-bold hover:bg-surface'
                            : 'text-ink hover:bg-surface-elevated'
                        )}
                      >
                        {format(d, 'd')}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Quick Presets Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-glass-border-subtle text-[11px] font-semibold text-ink-muted">
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className="px-2 py-1 rounded-lg hover:bg-surface hover:text-lavender-accent transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleDateSelect(addDays(new Date(), 1))}
                className="px-2 py-1 rounded-lg hover:bg-surface hover:text-lavender-accent transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleDateSelect(addDays(new Date(), 7))}
                className="px-2 py-1 rounded-lg hover:bg-surface hover:text-lavender-accent transition-colors"
              >
                Next Week
              </button>
              {selectedDate && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
