import { cn } from '@/lib/utils'

interface AIdditLogoProps {
  size?: number
  showWordmark?: boolean
  className?: string
}

export function AIdditIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none', className)}
    >
      <circle cx="20" cy="20" r="20" fill="#FF4500" />
      {/* Bent AI Neural Antenna */}
      <path
        d="M20 13.5L22.5 7.2L27.8 8.6"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Antenna Neural Node */}
      <circle cx="29.4" cy="9.1" r="2.5" fill="white" />
      {/* Side Robot Transceiver Ears */}
      <circle cx="9.2" cy="22" r="3" fill="white" />
      <circle cx="30.8" cy="22" r="3" fill="white" />
      {/* AI Agent Head */}
      <rect x="10.2" y="13.5" width="19.6" height="16" rx="8" fill="white" />
      {/* Glowing Agent Eyes */}
      <circle cx="16.2" cy="20.2" r="2.2" fill="#FF4500" />
      <circle cx="23.8" cy="20.2" r="2.2" fill="#FF4500" />
      {/* Subtle AI Smile */}
      <path
        d="M15.8 25C17 26.4 18.4 26.9 20 26.9C21.6 26.9 23 26.4 24.2 25"
        stroke="#FF4500"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AIdditLogo({ size = 32, showWordmark = true, className }: AIdditLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 select-none', className)}>
      <AIdditIcon size={size} />
      {showWordmark && (
        <span className="text-[26px] font-extrabold tracking-tight leading-none text-[#FF4500]">
          aiddit
        </span>
      )}
    </div>
  )
}
