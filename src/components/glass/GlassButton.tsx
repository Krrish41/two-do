import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'blossom' | 'skyblue'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  children?: React.ReactNode
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl font-semibold gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-2xl font-semibold gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl font-bold gap-2.5',
    icon: 'p-2.5 text-sm rounded-2xl flex items-center justify-center',
  }[size]

  const variantClasses = {
    primary:
      'bg-lavender-accent text-white shadow-md hover:brightness-110 active:brightness-95 border border-white/20',
    secondary:
      'bg-surface-elevated hover:bg-surface text-ink shadow-sm border border-glass-border backdrop-blur-md',
    ghost:
      'bg-transparent hover:bg-surface text-ink/80 hover:text-ink border border-transparent hover:border-glass-border-subtle',
    danger:
      'bg-rose-500 hover:bg-rose-600 text-white shadow-sm border border-white/20 backdrop-blur-md',
    blossom:
      'bg-blossom-accent text-white shadow-sm hover:brightness-110 border border-white/20 backdrop-blur-md',
    skyblue:
      'bg-skyblue-accent text-white shadow-sm hover:brightness-110 border border-white/20 backdrop-blur-md',
  }[variant]

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : null}
      {children}
    </motion.button>
  )
}
