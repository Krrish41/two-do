import React from 'react'
import { motion } from 'framer-motion'
import { useThemeStore } from '../../stores/themeStore'

export const BackgroundMesh: React.FC = () => {
  const isDark = useThemeStore((s) => s.isDark)

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Lavender / Deep Violet Aura */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full blur-[130px] transition-colors duration-700 ${
          isDark ? 'bg-lavender-700/20' : 'bg-lavender-400/25'
        }`}
      />

      {/* Skyblue / Electric Indigo Aura */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-[30%] -right-[15%] w-[60vw] h-[60vw] rounded-full blur-[140px] transition-colors duration-700 ${
          isDark ? 'bg-skyblue-700/20' : 'bg-skyblue-400/25'
        }`}
      />

      {/* Blossom / Magenta Glow Aura */}
      <motion.div
        animate={{
          x: [0, 40, -50, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -bottom-[15%] left-[20%] w-[50vw] h-[50vw] rounded-full blur-[130px] transition-colors duration-700 ${
          isDark ? 'bg-blossom-700/15' : 'bg-blossom-400/25'
        }`}
      />
    </div>
  )
}
