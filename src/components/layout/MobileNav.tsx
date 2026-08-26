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
      className="md:hidden fixed bottom-3.5 left-4 right-4 z-40 select-none"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="liquid-tabbar flex items-center justify-around py-2 px-2 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[58px] rounded-full transition-all duration-200"
            >
              {({ isActive }) => (
                <>
                  {/* Apple iOS 26 Liquid Glass 3D Refractive Lens with Chromatic Prism Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="liquid-glass-active-lens"
                      className="liquid-glass-lens"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 28,
                        mass: 0.8,
                      }}
                    />
                  )}

                  <Icon
                    size={20}
                    className={cn(
                      'relative z-10 transition-all duration-200',
                      isActive
                        ? 'text-lavender-accent scale-110 drop-shadow-[0_2px_10px_rgba(104,60,184,0.4)]'
                        : 'text-ink-muted hover:text-ink'
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
          className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-[58px] rounded-full text-ink-muted hover:text-ink transition-colors"
          title="Open Menu & Folders"
        >
          <MenuIcon size={20} className="relative z-10" />
          <span className="relative z-10 text-[10px] font-bold mt-0.5 tracking-tight">
            Menu
          </span>
        </button>
      </div>
    </nav>
  )
}
