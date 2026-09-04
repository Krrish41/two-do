import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export interface MenuBrandHeaderProps {
  className?: string
}

export const MenuBrandHeader: React.FC<MenuBrandHeaderProps> = ({ className }) => {
  return (
    <div className={cn('md:hidden flex items-center justify-between select-none pt-0.5', className)}>
      <Link
        to="/today"
        className="inline-flex items-center gap-2.5 group focus:outline-none w-fit transition-transform active:scale-95"
        title="Two-Do"
      >
        <img
          src="./logo.svg"
          alt="Two-Do"
          className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
        />
        <span className="font-extrabold text-lg sm:text-xl text-ink tracking-tight group-hover:text-lavender-accent transition-colors">
          Two-Do
        </span>
      </Link>
    </div>
  )
}
