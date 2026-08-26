import React from 'react'

export interface CoupleAvatarProps {
  userId?: string | null
  displayName?: string | null
  size?: number | string
  className?: string
  showOnlineBadge?: boolean
}

export const CoupleAvatar: React.FC<CoupleAvatarProps> = ({
  userId,
  displayName = '',
  size = 28,
  className = '',
  showOnlineBadge = false,
}) => {
  const isMissMickey =
    (displayName && displayName.toLowerCase().includes('mickey')) ||
    userId === '3e68344c-8643-4a56-a24a-5bb4c403f765' ||
    userId === 'demo-user-2'

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title={displayName || 'User'}
    >
      {isMissMickey ? (
        // Miss Mickey Mascot Avatar (Sweet Rose-Pink & Sky-Blue Blob with Bow)
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Base Background Blob */}
          <circle cx="18" cy="18" r="16" fill="url(#mickeyGrad)" />
          
          {/* Cute Bunny / Bear Ears */}
          <circle cx="10" cy="8" r="4.5" fill="#FFA5C7" />
          <circle cx="10" cy="8" r="2.5" fill="#FFE1ED" />
          <circle cx="26" cy="8" r="4.5" fill="#FFA5C7" />
          <circle cx="26" cy="8" r="2.5" fill="#FFE1ED" />

          {/* Main Face Blob */}
          <ellipse cx="18" cy="20" rx="13" ry="12" fill="#FFE8F2" />

          {/* Signature Cute Ribbon Bow */}
          <g transform="translate(18, 9)">
            <path
              d="M -7 -3 C -5 -6 -1 -3 -1 0 C -1 3 -5 6 -7 3 Z"
              fill="#FF6B9E"
            />
            <path
              d="M 7 -3 C 5 -6 1 -3 1 0 C 1 3 5 6 7 3 Z"
              fill="#FF6B9E"
            />
            <circle cx="0" cy="0" r="2.2" fill="#FF3D7F" />
          </g>

          {/* Happy Eyes */}
          <circle cx="13.5" cy="19" r="1.5" fill="#3D2947" />
          <circle cx="14" cy="18.5" r="0.5" fill="#FFFFFF" />
          <circle cx="22.5" cy="19" r="1.5" fill="#3D2947" />
          <circle cx="23" cy="18.5" r="0.5" fill="#FFFFFF" />

          {/* Blush Cheeks */}
          <circle cx="11" cy="21.5" r="2" fill="#FFA1C5" opacity="0.8" />
          <circle cx="25" cy="21.5" r="2" fill="#FFA1C5" opacity="0.8" />

          {/* Smile */}
          <path
            d="M 16 22.5 Q 18 24.5 20 22.5"
            stroke="#3D2947"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="mickeyGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A7C7E7" />
              <stop offset="1" stopColor="#F5A9C9" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        // Dr. Bubs Mascot Avatar (Soft Lavender & Purple Blob with Dapper Glasses & Sparkle)
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Base Background Blob */}
          <circle cx="18" cy="18" r="16" fill="url(#bubsGrad)" />

          {/* Little Cute Ears */}
          <circle cx="9" cy="9" r="4" fill="#A88FEB" />
          <circle cx="9" cy="9" r="2.2" fill="#E4DBF7" />
          <circle cx="27" cy="9" r="4" fill="#A88FEB" />
          <circle cx="27" cy="9" r="2.2" fill="#E4DBF7" />

          {/* Main Face Blob */}
          <ellipse cx="18" cy="20" rx="13" ry="12" fill="#F3EEFA" />

          {/* Dapper Rounded Glasses */}
          <circle cx="13.5" cy="19" r="3.6" stroke="#4A3B69" strokeWidth="1.2" fill="#FFFFFF" fillOpacity="0.4" />
          <circle cx="22.5" cy="19" r="3.6" stroke="#4A3B69" strokeWidth="1.2" fill="#FFFFFF" fillOpacity="0.4" />
          <line x1="17.1" y1="19" x2="18.9" y2="19" stroke="#4A3B69" strokeWidth="1.2" />

          {/* Smart Happy Eyes */}
          <circle cx="13.5" cy="19" r="1.4" fill="#2E1C47" />
          <circle cx="14" cy="18.5" r="0.5" fill="#FFFFFF" />
          <circle cx="22.5" cy="19" r="1.4" fill="#2E1C47" />
          <circle cx="23" cy="18.5" r="0.5" fill="#FFFFFF" />

          {/* Soft Purple Blush */}
          <circle cx="9.5" cy="21.5" r="1.8" fill="#C4AEF0" opacity="0.9" />
          <circle cx="26.5" cy="21.5" r="1.8" fill="#C4AEF0" opacity="0.9" />

          {/* Friendly Smile */}
          <path
            d="M 16 23 Q 18 25 20 23"
            stroke="#2E1C47"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Little Sparkle */}
          <path
            d="M 28 6 L 28.8 8 L 31 8.8 L 28.8 9.6 L 28 12 L 27.2 9.6 L 25 8.8 L 27.2 8 Z"
            fill="#FBBF24"
          />

          <defs>
            <linearGradient id="bubsGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8E6BD9" />
              <stop offset="1" stopColor="#C4AEF0" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {showOnlineBadge && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-obsidian" />
      )}
    </div>
  )
}
