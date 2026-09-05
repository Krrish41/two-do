import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
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

  // Spring-smoothed scroll position:
  // Cushions velocity spikes during quick flicks or scrolling up/down quickly,
  // ensuring the header expands and contracts at the speed of scrolling smoothly without stutter.
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 400,
    damping: 38,
    mass: 0.3,
    restDelta: 0.5,
  })

  // Top bar brand wordmark: fades out smoothly over initial scroll (0 -> 28px)
  const brandWordmarkOpacity = useTransform(smoothScrollY, [0, 28], [1, 0], { clamp: true })
  const brandWordmarkY = useTransform(smoothScrollY, [0, 28], [0, -6], { clamp: true })

  // Large title row collapse: fades out and collapses height over 0 -> 68px
  // The natural scroll range (68px) ensures that quick or slow scroll tracks
  // the user's finger continuously across multiple frames instead of snapping in a single frame.
  const largeTitleOpacity = useTransform(smoothScrollY, [0, 36], [1, 0], { clamp: true })
  const largeTitleHeight = useTransform(smoothScrollY, [0, 68], [38, 0], { clamp: true })
  const largeTitleScale = useTransform(smoothScrollY, [0, 44], [1, 0.90], { clamp: true })
  const largeTitleY = useTransform(smoothScrollY, [0, 44], [0, -6], { clamp: true })

  // Compact page title: smoothly fades in as the large title vanishes (36 -> 68px)
  const compactTitleOpacity = useTransform(smoothScrollY, [36, 68], [0, 1], { clamp: true })
  const compactTitleY = useTransform(smoothScrollY, [36, 68], [5, 0], { clamp: true })

  // Header bottom padding and hairline divider
  const headerPaddingBottom = useTransform(smoothScrollY, [0, 68], [12, 10], { clamp: true })
  const dividerOpacity = useTransform(smoothScrollY, [42, 70], [0, 1], { clamp: true })

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
