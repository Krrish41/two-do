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

  // Motion values interpolating over the first 60px of scroll
  const brandRowOpacity = useTransform(scrollY, [0, 40], [1, 0])
  const brandRowHeight = useTransform(scrollY, [0, 40], [22, 0])
  const brandRowMarginBottom = useTransform(scrollY, [0, 40], [6, 0])

  const titleFontSize = useTransform(scrollY, [0, 60], [28, 17])
  const titleLineHeight = useTransform(scrollY, [0, 60], [34, 22])
  const titlePaddingTop = useTransform(scrollY, [0, 60], [8, 2])
  const headerPaddingBottom = useTransform(scrollY, [0, 60], [14, 8])

  const dividerOpacity = useTransform(scrollY, [40, 60], [0, 1])

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
        className="px-4 pt-2.5 flex flex-col justify-center min-h-[50px]"
      >
        {/* Chrome: Small, muted Two-Do brand row (fades and collapses on scroll) */}
        <motion.div
          style={{
            opacity: brandRowOpacity,
            height: brandRowHeight,
            marginBottom: brandRowMarginBottom,
            overflow: 'hidden',
          }}
          className="flex items-center"
        >
          <Link
            to="/today"
            className="inline-flex items-center gap-1.5 focus:outline-none transition-opacity active:opacity-75"
            title="Two-Do"
          >
            <img
              src="./logo.svg"
              alt="Two-Do"
              className="w-4 h-4 drop-shadow-xs flex-shrink-0"
            />
            <span className="text-xs font-semibold text-ink-muted/80 tracking-tight">
              Two-Do
            </span>
          </Link>
        </motion.div>

        {/* Focus: Page Title (interpolates from large bold title to compact bar title) */}
        <motion.div
          style={{ paddingTop: titlePaddingTop }}
          className="flex items-center min-w-0"
        >
          <motion.h1
            style={{
              fontSize: titleFontSize,
              lineHeight: titleLineHeight,
            }}
            className="font-extrabold text-ink tracking-tight truncate m-0"
          >
            {title}
          </motion.h1>
        </motion.div>
      </motion.div>

      {/* Hairline glass divider - only visible when compact / collapsed */}
      <motion.div
        style={{ opacity: dividerOpacity }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-glass-border-subtle shadow-xs pointer-events-none"
      />
    </header>
  )
}
