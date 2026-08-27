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
      className="md:hidden fixed bottom-3.5 left-0 right-0 z-40 select-none flex justify-center pointer-events-none px-3"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Outer Floating Liquid Glass Capsule */}
      <div className="w-[92%] max-w-[390px] h-[64px] rounded-full p-1.5 flex items-center justify-between pointer-events-auto bg-white/80 dark:bg-[#181226]/85 backdrop-blur-2xl border border-white/90 dark:border-white/15 shadow-[0_16px_40px_-6px_rgba(104,60,184,0.18),0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,0.95)] dark:shadow-[0_20px_48px_-6px_rgba(0,0,0,0.7),0_0_24px_rgba(139,92,246,0.15),inset_0_1px_1.5px_rgba(255,255,255,0.2)]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentActive === item.to

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'relative flex-1 h-full flex flex-col items-center justify-center select-none outline-none cursor-pointer rounded-[20px] transition-colors duration-150',
                isActive
                  ? 'text-lavender-accent'
                  : 'text-[#443D4E] dark:text-[#A69EBA] hover:text-ink'
              )}
            >
              {/* Elevated Liquid Glass Pill Bubble for Active Tab */}
              {isActive && (
                <motion.div
                  layoutId="mobile-liquid-bubble-pill"
                  className="absolute inset-0.5 rounded-[22px] bg-white dark:bg-white/[0.12] border border-white/95 dark:border-white/20 shadow-[0_6px_20px_rgba(104,60,184,0.18),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_16px_rgba(139,92,246,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                  transition={{
                    type: 'spring',
                    stiffness: 440,
                    damping: 30,
                    mass: 0.8,
                  }}
                />
              )}

              <Icon
                size={20}
                className={cn(
                  'relative z-10 flex-shrink-0 transition-transform duration-200',
                  isActive
                    ? 'scale-105 text-lavender-accent stroke-[2.2] drop-shadow-[0_2px_8px_rgba(104,60,184,0.35)]'
                    : 'text-[#443D4E] dark:text-[#A69EBA] stroke-[1.8]'
                )}
              />

              <span
                className={cn(
                  'relative z-10 text-[10.5px] mt-0.5 tracking-tight transition-colors duration-200 leading-tight',
                  isActive
                    ? 'text-lavender-accent font-extrabold'
                    : 'text-[#443D4E] dark:text-[#A69EBA] font-semibold'
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
