import React from 'react'
import { Check, Sparkles } from 'lucide-react'
import { NOTE_COLOR_PRESETS } from '../../stores/noteStore'
import { useThemeStore } from '../../stores/themeStore'
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
  const isDark = useThemeStore((s) => s.isDark)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {NOTE_COLOR_PRESETS.map((preset) => {
        const isClear = preset.id === 'clear'
        const isSelected = isClear
          ? (!selectedColor || selectedColor === '#FAF8F5' || selectedColor.toLowerCase() === preset.hex.toLowerCase() || selectedColor.startsWith('rgba'))
          : selectedColor?.toLowerCase() === preset.hex.toLowerCase()
        const swatchColor = isDark ? preset.swatchDark : preset.swatchLight

        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectColor(preset.hex)}
            title={preset.name}
            style={!isClear ? { backgroundColor: swatchColor } : {}}
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs border focus:outline-none select-none cursor-pointer',
              isClear
                ? 'bg-white/90 dark:bg-white/10 border-2 border-dashed border-lavender-accent shadow-xs'
                : 'border-black/25 dark:border-white/30',
              isSelected
                ? 'scale-125 ring-2 ring-lavender-accent ring-offset-2 ring-offset-surface-elevated shadow-md'
                : 'hover:scale-110 opacity-80 hover:opacity-100'
            )}
          >
            {isSelected && !isClear && (
              <Check
                className={cn(
                  'w-3.5 h-3.5 stroke-[3]',
                  isDark ? 'text-white drop-shadow-sm' : 'text-purple-950/90 drop-shadow-xs'
                )}
              />
            )}
            {isClear && !isSelected && <Sparkles className="w-2.5 h-2.5 text-lavender-accent" />}
            {isClear && isSelected && <Check className="w-3.5 h-3.5 text-lavender-accent stroke-[3]" />}
          </button>
        )
      })}
    </div>
  )
}
