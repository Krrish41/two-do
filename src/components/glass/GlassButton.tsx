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
    sm: 'px-3 py-1.5 text-xs rounded-xl font-medium gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-2xl font-medium gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl font-semibold gap-2.5',
    icon: 'p-2.5 text-sm rounded-2xl flex items-center justify-center',
  }[size]

  const variantClasses = {
    primary:
      'bg-lavender-600/90 hover:bg-lavender-600 text-white shadow-md shadow-lavender-600/20 backdrop-blur-md border border-white/30',
    secondary:
      'bg-white/60 hover:bg-white/80 text-ink shadow-sm border border-white/60 backdrop-blur-md',
    ghost:
      'bg-transparent hover:bg-white/40 text-ink/80 hover:text-ink border border-transparent hover:border-white/30',
    danger:
      'bg-rose-500/80 hover:bg-rose-500 text-white shadow-sm border border-white/20 backdrop-blur-md',
    blossom:
      'bg-blossom-400/90 hover:bg-blossom-600 text-white shadow-sm border border-white/30 backdrop-blur-md',
    skyblue:
      'bg-skyblue-600/90 hover:bg-skyblue-600 text-white shadow-sm border border-white/30 backdrop-blur-md',
  }[variant]

  return (
    <motion.button
      whileHover={disabled || loading ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center transition-colors select-none disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </motion.button>
  )
}
