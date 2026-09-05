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

  // Top bar label transition: "Two-Do" fades out, page title fades in beside the logo
  const brandWordmarkOpacity = useTransform(scrollY, [0, 30], [1, 0])
  const brandWordmarkY = useTransform(scrollY, [0, 30], [0, -6])
  const compactTitleOpacity = useTransform(scrollY, [20, 50], [0, 1])
  const compactTitleY = useTransform(scrollY, [20, 50], [6, 0])

  // Large title row collapse: fades and collapses height to 0
  const largeTitleOpacity = useTransform(scrollY, [0, 35], [1, 0])
  const largeTitleHeight = useTransform(scrollY, [0, 50], [38, 0])
  const largeTitleScale = useTransform(scrollY, [0, 40], [1, 0.92])
  const largeTitleY = useTransform(scrollY, [0, 40], [0, -6])

  // Header bottom padding and hairline divider
  const headerPaddingBottom = useTransform(scrollY, [0, 50], [12, 10])
  const dividerOpacity = useTransform(scrollY, [35, 55], [0, 1])

  return (
    <header
      className={cn(
        'md:hidden sticky top-0 z-30 w-full select-none',
        'bg-surface/85 dark:bg-[#0D0A16]/85 backdrop-blur-2xl transition-colors',
        className
      )}
    >
      <motion.div
        style={{ paddingBottom: headerPaddingBottom }}
        className="px-4 pt-3 flex flex-col justify-center"
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
