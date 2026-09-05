import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface CollapsingHeaderProps {
  title: string
  containerRef?: React.RefObject<HTMLElement | null>
  className?: string
}

export const CollapsingHeader: React.FC<CollapsingHeaderProps> = ({
  title,
  containerRef,
  className,
}) => {
  const { scrollY } = useScroll(containerRef ? { container: containerRef as any } : undefined)

  // Direct 1:1 scroll tracking:
  // Tracks the user's touch movement directly with 0 artificial spring lag or delayed bounce,
  // ensuring the header expands and contracts naturally in real-time.
  const brandWordmarkOpacity = useTransform(scrollY, [0, 20], [1, 0], { clamp: true })
  const brandWordmarkY = useTransform(scrollY, [0, 20], [0, -4], { clamp: true })

  // Large title row collapse: fades out and collapses height over 0 -> 48px
  const largeTitleOpacity = useTransform(scrollY, [0, 26], [1, 0], { clamp: true })
  const largeTitleHeight = useTransform(scrollY, [0, 48], [32, 0], { clamp: true })
  const largeTitleScale = useTransform(scrollY, [0, 36], [1, 0.94], { clamp: true })
  const largeTitleY = useTransform(scrollY, [0, 36], [0, -4], { clamp: true })

  // Compact page title: smoothly fades in as the large title vanishes
  const compactTitleOpacity = useTransform(scrollY, [24, 48], [0, 1], { clamp: true })
  const compactTitleY = useTransform(scrollY, [24, 48], [4, 0], { clamp: true })

  // Header bottom padding and hairline divider
  const headerPaddingBottom = useTransform(scrollY, [0, 48], [6, 4], { clamp: true })
  const dividerOpacity = useTransform(scrollY, [30, 50], [0, 1], { clamp: true })

  return (
    <header
      className={cn(
        'md:hidden sticky top-0 z-30 w-full select-none transform-gpu',
        'bg-surface/85 dark:bg-[#0D0A16]/85 backdrop-blur-2xl transition-colors',
        className
      )}
    >
      <motion.div
        style={{ paddingBottom: headerPaddingBottom }}
        className="px-3.5 pt-2 flex flex-col justify-center"
      >
        {/* Row 1: Logo + [Two-Do (at top) -> Page Title (scrolled)] */}
        <div className="flex items-center gap-2 h-7 min-w-0">
          <Link
            to="/today"
            className="flex-shrink-0 inline-flex items-center focus:outline-none transition-opacity active:opacity-75"
            title="Two-Do"
          >
            <img
              src="./logo.svg"
              alt="Two-Do"
              className="w-4 h-4 drop-shadow-xs"
            />
          </Link>

          {/* Morphing Wordmark / Compact Title Container */}
          <div className="relative flex-1 h-5 flex items-center min-w-0 overflow-hidden">
            {/* Expanded State: Muted "Two-Do" Wordmark */}
            <motion.span
              style={{
                opacity: brandWordmarkOpacity,
                y: brandWordmarkY,
              }}
              className="absolute left-0 text-xs font-semibold text-ink-muted tracking-tight pointer-events-none"
            >
              Two-Do
            </motion.span>

            {/* Scrolled State: Bold Page Title directly beside Logo */}
            <motion.span
              style={{
                opacity: compactTitleOpacity,
                y: compactTitleY,
              }}
              className="absolute left-0 text-sm font-bold text-ink tracking-tight truncate pointer-events-none"
            >
              {title}
            </motion.span>
          </div>
        </div>

        {/* Row 2: Large Title (at top only, smoothly collapses away on scroll) */}
        <motion.div
          style={{
            opacity: largeTitleOpacity,
            height: largeTitleHeight,
            scale: largeTitleScale,
            y: largeTitleY,
            transformOrigin: 'top left',
            overflow: 'hidden',
          }}
          className="flex items-center min-w-0 mt-0.5"
        >
          <h1 className="text-2xl font-extrabold text-ink tracking-tight leading-tight truncate m-0">
            {title}
          </h1>
        </motion.div>
      </motion.div>

      {/* Hairline glass divider - only visible when compact / scrolled */}
      <motion.div
        style={{ opacity: dividerOpacity }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-glass-border-subtle shadow-xs pointer-events-none"
      />
    </header>
  )
}
