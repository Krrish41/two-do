import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  containerClassName?: string
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ icon, rightIcon, error, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('w-full flex flex-col gap-1', containerClassName)}>
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-ink/50">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full glass-input text-ink placeholder:text-ink/40 text-sm rounded-2xl px-4 py-2.5 outline-none',
              icon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-ink/50">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-rose-500 font-medium px-2">{error}</span>}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'
