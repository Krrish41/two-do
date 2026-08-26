import React from 'react'
import { Check } from 'lucide-react'
import { NOTE_COLOR_PRESETS } from '../../stores/noteStore'
import { cn } from '../../lib/utils'

export interface ColorSwatchPickerProps {
  selectedColor: string
  onSelectColor: (hex: string) => void
  className?: string
}

export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({
  selectedColor,
  onSelectColor,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {NOTE_COLOR_PRESETS.map((preset) => {
        const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase()
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectColor(preset.hex)}
            title={preset.name}
            style={{ backgroundColor: preset.hex }}
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150 shadow-xs border border-white/60 focus:outline-none',
              isSelected ? 'scale-110 ring-2 ring-ink/40 ring-offset-2' : 'hover:scale-105 opacity-80 hover:opacity-100'
            )}
          >
            {isSelected && <Check className="w-3 h-3 text-ink stroke-[3]" />}
          </button>
        )
      })}
    </div>
  )
}
