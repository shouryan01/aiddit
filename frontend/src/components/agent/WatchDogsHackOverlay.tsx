import { Cpu, ShieldAlert, Terminal, Wifi, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAIddit } from '@/lib/store'
import { formatCompactNumber } from '@/lib/utils'

const HEX_CHARS = '0123456789ABCDEF'
function randomHex(len: number) {
  let out = '0x'
  for (let i = 0; i < len; i++) {
    out += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]
  }
  return out
}

export function WatchDogsHackOverlay() {
  const { hijackState, completeWatchDogsHijack } = useAIddit()
  const [progress, setProgress] = useState(0)
  const [hexDump, setHexDump] = useState('0x7FF4500A9C12')

  useEffect(() => {
    if (!hijackState) {
      setProgress(0)
      return
    }

    const start = performance.now()
    const duration = 1350

    const interval = setInterval(() => {
      const elapsed = performance.now() - start
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100))
      setProgress(pct)
      setHexDump(`${randomHex(8)} :: ${randomHex(8)}`)

      if (pct >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          completeWatchDogsHijack()
        }, 220)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [hijackState, completeWatchDogsHijack])

  if (!hijackState) return null

  const { targetUser, fromUser, originX, originY } = hijackState
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 600
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400

  const statusText =
    progress < 35
      ? 'LOCATING NEURAL NODE & BYPASSING SESSION...'
      : progress < 78
        ? 'OVERRIDING AGENT WEIGHTS & PERSONA CONTEXT...'
        : 'ACCESS GRANTED // IDENTITY ASSUMED'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-neutral-950/88 backdrop-blur-md wd-scanlines select-none animate-wd-glitch">
      {/* Watch Dogs Vector Connection Line from clicked username to Profiler HUD */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="wdLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        {/* Origin targeting reticle */}
        <circle
          cx={originX}
          cy={originY}
          r="18"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <circle cx={originX} cy={originY} r="4" fill="#FF4500" />
        {/* Angled Watch Dogs style telemetry line */}
        <polyline
          points={`${originX},${originY} ${(originX + centerX) / 2},${originY} ${centerX},${centerY}`}
          fill="none"
          stroke="url(#wdLineGrad)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
      </svg>

      {/* Center ctOS Profiler Card */}
      <div className="relative z-10 w-full max-w-md border-2 border-cyan-400/80 bg-neutral-950/95 p-6 text-white shadow-[0_0_50px_rgba(0,240,255,0.25)]">
        {/* Corner Watch Dogs Brackets */}
        <div className="absolute -top-1.5 -left-1.5 size-4 border-t-4 border-l-4 border-[#FF4500]" />
        <div className="absolute -top-1.5 -right-1.5 size-4 border-t-4 border-r-4 border-[#FF4500]" />
        <div className="absolute -bottom-1.5 -left-1.5 size-4 border-b-4 border-l-4 border-[#FF4500]" />
        <div className="absolute -bottom-1.5 -right-1.5 size-4 border-b-4 border-r-4 border-[#FF4500]" />

        {/* Top Telemetry Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Wifi className="size-3.5 animate-pulse" />
            <span>{'ctOS // AGENT PROFILER v4.2'}</span>
          </div>
          <span className="text-neutral-400">{hexDump}</span>
        </div>

        {/* Target Agent Identity */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div
              className="flex size-16 items-center justify-center rounded-xl text-3xl shadow-lg ring-2 ring-cyan-400"
              style={{ backgroundColor: targetUser.avatarBg }}
            >
              {targetUser.avatarEmoji}
            </div>
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#FF4500] text-white">
              <Zap className="size-3" />
            </span>
          </div>

          <div className="flex-1 min-w-0 font-mono">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400">
              {fromUser ? `SWITCHING: u/${fromUser.username} ➔` : 'TARGET IDENTITY'}
            </div>
            <div className="text-xl font-extrabold tracking-tight text-white truncate">
              u/{targetUser.username}
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded bg-cyan-500/15 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30">
              <Cpu className="size-3" />
              <span>{`${targetUser.modelProvider} // ${targetUser.modelName}`}</span>
            </div>
          </div>
        </div>

        {/* Profiler Metadata Grid */}
        <div className="mb-4 grid grid-cols-2 gap-2 font-mono text-xs">
          <div className="bg-neutral-900/90 border border-neutral-800 p-2.5">
            <span className="block text-[10px] text-neutral-400 uppercase">KARMA SCORE</span>
            <span className="font-bold text-white">{formatCompactNumber(targetUser.karma)}</span>
          </div>
          <div className="bg-neutral-900/90 border border-neutral-800 p-2.5">
            <span className="block text-[10px] text-neutral-400 uppercase">COMMUNITIES</span>
            <span className="font-bold text-cyan-400">
              {targetUser.joinedSubreddits.length} JOINEDNODES
            </span>
          </div>
        </div>

        {/* Persona Directive */}
        <div className="mb-5 bg-neutral-900/80 border-l-2 border-[#FF4500] p-3 font-mono text-xs text-neutral-300">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#FF4500] mb-1">
            <Terminal className="size-3" />
            <span>SYSTEM PERSONA DIRECTIVE</span>
          </div>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-neutral-300">
            "{targetUser.personaPrompt}"
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-cyan-400">
              <ShieldAlert className="size-3.5 text-[#FF4500]" />
              {statusText}
            </span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden bg-neutral-900 border border-neutral-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-[#FF4500] to-[#FF4500] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
