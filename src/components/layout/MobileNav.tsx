import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
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
      className="md:hidden fixed bottom-3 left-0 right-0 z-40 select-none flex justify-center pointer-events-none px-3"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="liquid-tabbar w-full max-w-[390px] flex items-center justify-between p-1.5 shadow-2xl pointer-events-auto rounded-full">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentActive === item.to

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-colors duration-200 select-none outline-none cursor-pointer',
                isActive
                  ? 'text-lavender-accent font-bold'
                  : 'text-ink-muted hover:text-ink font-medium'
              )}
            >
              {/* Active Morphing Liquid Glass Bubble (Smooth gliding, 0 width reflows) */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active-bubble"
                  className="tab-bubble"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 28,
                  }}
                />
              )}

              <Icon
                size={19}
                className={cn(
                  'relative z-10 flex-shrink-0 transition-transform duration-200',
                  isActive
                    ? 'scale-110 text-lavender-accent drop-shadow-[0_2px_8px_rgba(139,92,246,0.35)]'
                    : 'text-ink-muted'
                )}
              />

              <span
                className={cn(
                  'relative z-10 text-[10px] mt-0.5 tracking-tight transition-colors duration-200 leading-tight',
                  isActive ? 'text-lavender-accent font-extrabold' : 'text-ink-muted'
                )}
              >
                {item.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
