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
  style,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-xl font-bold gap-1.5',
    md: 'px-4 py-2 text-sm rounded-2xl font-bold gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl font-extrabold gap-2.5',
    icon: 'p-2 text-sm rounded-2xl flex items-center justify-center',
  }[size]

  const variantClasses = {
    primary:
      'text-white shadow-md border border-white/20 hover:brightness-110 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
    secondary:
      'bg-surface hover:bg-surface-elevated text-ink shadow-xs border border-glass-border disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
      'bg-transparent hover:bg-surface text-ink-muted hover:text-ink border border-transparent hover:border-glass-border-subtle',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-white/20 disabled:opacity-50',
    blossom:
      'bg-blossom-accent text-white shadow-sm hover:brightness-110 border border-white/20 disabled:opacity-50',
    skyblue:
      'bg-skyblue-accent text-white shadow-sm hover:brightness-110 border border-white/20 disabled:opacity-50',
  }[variant]

  const defaultStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          background: 'linear-gradient(135deg, #683CB8 0%, #1B6CB5 100%)',
          color: '#FFFFFF',
          ...style,
        }
      : style || {}

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      disabled={disabled || loading}
      style={defaultStyle}
      className={cn(
        'inline-flex items-center justify-center transition-all select-none',
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : null}
      {children}
    </motion.button>
  )
}
