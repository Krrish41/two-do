import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  SunIcon,
  CheckCircleIcon,
  NotesIcon,
  HeartIcon,
  MenuIcon,
} from '../icons'
import { cn } from '../../lib/utils'

export interface MobileNavProps {
  onOpenMenu?: () => void
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenMenu }) => {
  const navItems = [
    { to: '/today', label: 'Today', icon: SunIcon },
    { to: '/tasks', label: 'Tasks', icon: CheckCircleIcon },
    { to: '/notes', label: 'Notes', icon: NotesIcon },
    { to: '/bucket-list', label: 'Bucket', icon: HeartIcon },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-3 left-3 right-3 z-40 select-none"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="liquid-tabbar flex items-center justify-around py-1.5 px-1.5 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center justify-center py-1 px-2.5 min-w-[56px] rounded-2xl transition-all duration-200"
            >
              {({ isActive }) => (
                <>
                  {/* Liquid Morphing Selection Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="liquid-active-tab"
                      className="absolute inset-0 bg-lavender-accent/20 rounded-2xl border border-lavender-accent/30 shadow-inner"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  <Icon
                    size={19}
                    className={cn(
                      'relative z-10 transition-all duration-200',
                      isActive ? 'text-lavender-accent scale-110' : 'text-ink-muted'
                    )}
                  />
                  <span
                    className={cn(
                      'relative z-10 text-[10px] font-bold mt-0.5 tracking-tight transition-all duration-200',
                      isActive ? 'text-lavender-accent font-extrabold' : 'text-ink-muted'
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}

        {/* 5th Tab: Menu (Opens Sidebar on Mobile) */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="relative flex flex-col items-center justify-center py-1 px-2.5 min-w-[56px] rounded-2xl text-ink-muted hover:text-ink transition-colors"
          title="Open Menu & Folders"
        >
          <MenuIcon size={19} className="relative z-10" />
          <span className="relative z-10 text-[10px] font-bold mt-0.5 tracking-tight">
            Menu
          </span>
        </button>
      </div>
    </nav>
  )
}
