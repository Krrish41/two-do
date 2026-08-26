import React from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface GlassCardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'subtle' | 'elevated'
  interactive?: boolean
  className?: string
  children?: React.ReactNode
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...props
}) => {
  const variantClass = {
    default: 'glass-panel',
    subtle: 'glass-panel-subtle rounded-2xl',
    elevated: 'glass-panel-elevated',
  }[variant]

  const interactiveProps = interactive
    ? {
        whileHover: { scale: 1.015, y: -2 },
        whileTap: { scale: 0.985 },
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
      }
    : {}

  return (
    <motion.div
      className={cn(
        variantClass,
        'p-5 transition-shadow duration-200',
        interactive && 'cursor-pointer hover:shadow-xl',
        className
      )}
      {...interactiveProps}
      {...props}
    >
      {children}
    </motion.div>
  )
}
