import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SunIcon,
  CheckCircleIcon,
  NotesIcon,
  HeartIcon,
  MenuIcon,
} from '../icons'
import { cn } from '../../lib/utils'

export const MobileNav: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { to: '/today', label: 'Today', icon: SunIcon },
    { to: '/tasks', label: 'Tasks', icon: CheckCircleIcon },
    { to: '/notes', label: 'Notes', icon: NotesIcon },
    { to: '/bucket-list', label: 'Bucket', icon: HeartIcon },
    { to: '/menu', label: 'Menu', icon: MenuIcon },
  ]

  // Helper to determine active tab
  const getActiveTab = (pathname: string) => {
    if (pathname === '/today' || pathname === '/') return '/today'
    if (pathname === '/tasks') return '/tasks'
    if (pathname === '/notes') return '/notes'
    if (pathname === '/bucket-list') return '/bucket-list'
    if (
      pathname === '/menu' ||
      pathname === '/important' ||
      pathname === '/completed' ||
      pathname === '/recycle-bin' ||
      pathname.startsWith('/folder/')
    )
      return '/menu'
    return '/today'
  }

  const currentActive = getActiveTab(location.pathname)

  return (
    <nav
      className="md:hidden fixed bottom-3.5 left-0 right-0 z-40 select-none flex justify-center pointer-events-none px-4"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="liquid-tabbar inline-flex items-center justify-center gap-1 p-1.5 shadow-2xl pointer-events-auto max-w-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentActive === item.to

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'relative flex items-center justify-center transition-colors duration-200 select-none outline-none',
                isActive
                  ? 'px-3.5 py-2 rounded-[20px] text-lavender-accent font-bold'
                  : 'p-2.5 rounded-[20px] text-ink-muted hover:text-ink'
              )}
            >
              {/* Active Morphing Liquid Glass Bubble */}
              {isActive && (
                <motion.div
                  layoutId="tab-bubble"
                  className="tab-bubble"
                  whileTap={{ scale: 1.06 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 32,
                  }}
                />
              )}

              <Icon
                size={20}
                className={cn(
                  'relative z-10 flex-shrink-0 transition-transform duration-200',
                  isActive
                    ? 'text-lavender-accent scale-105 drop-shadow-[0_2px_8px_rgba(139,92,246,0.35)]'
                    : 'text-ink-muted'
                )}
              />

              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.span
                    layout
                    initial={{ opacity: 0, width: 0, scale: 0.9 }}
                    animate={{ opacity: 1, width: 'auto', scale: 1 }}
                    exit={{ opacity: 0, width: 0, scale: 0.9 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 32,
                    }}
                    className="relative z-10 text-[11px] font-extrabold ml-1.5 tracking-tight whitespace-nowrap overflow-hidden text-lavender-accent"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
