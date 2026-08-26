import React from 'react'
import { motion } from 'framer-motion'

export const BackgroundMesh: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Lavender Aura */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-lavender-400/25 blur-[120px]"
      />

      {/* Skyblue Aura */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[30%] -right-[15%] w-[60vw] h-[60vw] rounded-full bg-skyblue-400/25 blur-[140px]"
      />

      {/* Blossom Aura */}
      <motion.div
        animate={{
          x: [0, 40, -50, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[15%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-blossom-400/25 blur-[130px]"
      />
    </div>
  )
}
