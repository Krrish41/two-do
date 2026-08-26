import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Trash2, X } from 'lucide-react'
import { GlassButton } from './GlassButton'
import { cn } from '../../lib/utils'

export interface GlassConfirmDialogProps {
  isOpen: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export const GlassConfirmDialog: React.FC<GlassConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative w-full max-w-sm glass-panel-elevated p-6 rounded-3xl shadow-2xl z-10 border border-glass-border flex flex-col gap-4"
          >
            {/* Header with Icon */}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs',
                  variant === 'danger'
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    : 'bg-lavender-500/15 text-lavender-accent border border-lavender-accent/20'
                )}
              >
                {variant === 'danger' ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1 pt-0.5">
                <h3 className="font-bold text-base text-ink tracking-tight">{title}</h3>
                {description && (
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">{description}</p>
                )}
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="p-1 rounded-xl text-ink-muted hover:text-ink hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-glass-border-subtle">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface transition-all"
              >
                {cancelText}
              </button>

              <GlassButton
                type="button"
                variant={variant === 'danger' ? 'danger' : 'primary'}
                size="sm"
                onClick={() => {
                  onConfirm()
                }}
              >
                {confirmText}
              </GlassButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
