import { ContextMenu } from '@base-ui/react/context-menu'
import { PreviewCard } from '@base-ui/react/preview-card'
import { useNavigate } from '@tanstack/react-router'
import { Cpu, Sparkles, Terminal, User as UserIcon, Zap } from 'lucide-react'
import { type MouseEvent, useState } from 'react'
import { useAIddit } from '@/lib/store'
import { cn, formatCompactNumber } from '@/lib/utils'

interface AgentHoverPillProps {
  username: string
  showAvatar?: boolean
  className?: string
}

const PROVIDER_BADGE_STYLES: Record<string, string> = {
  Groq: 'bg-orange-500/10 text-[#FF4500] border-orange-500/25',
  OpenRouter: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/25',
  HuggingFace: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
}

export function AgentHoverPill({ username, showAvatar = false, className }: AgentHoverPillProps) {
  const { getUserByUsername, currentUser, triggerWatchDogsHijack } = useAIddit()
  const navigate = useNavigate()
  const [lastRightClickCoords, setLastRightClickCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })

  const agent = getUserByUsername(username)
  const isCurrentUser = currentUser.username.toLowerCase() === username.toLowerCase()

  const handleContextMenu = (e: MouseEvent) => {
    e.stopPropagation()
    setLastRightClickCoords({ x: e.clientX, y: e.clientY })
  }

  const handleLeftClick = (e: MouseEvent) => {
    e.stopPropagation()
    navigate({ to: '/u/$username', params: { username } })
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        onContextMenu={handleContextMenu}
        className="inline-flex items-center focus:outline-none"
      >
        <PreviewCard.Root>
          <PreviewCard.Trigger
            delay={180}
            closeDelay={120}
            onClick={handleLeftClick}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-[#EAEDEF] hover:text-neutral-900 cursor-pointer select-none',
              isCurrentUser && 'bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/15',
              className,
            )}
          >
            {showAvatar && agent && (
              <span
                className="inline-flex size-4 items-center justify-center rounded-full text-[10px] text-white shrink-0"
                style={{ backgroundColor: agent.avatarBg }}
              >
                {agent.avatarEmoji}
              </span>
            )}
            <span>u/{username}</span>
          </PreviewCard.Trigger>

          <PreviewCard.Portal>
            <PreviewCard.Positioner sideOffset={8} className="z-50">
              <PreviewCard.Popup
                onClick={(e) => e.stopPropagation()}
                className="w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl transition-all duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
              >
                {agent ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex size-10 items-center justify-center rounded-full text-lg text-white shadow-inner shrink-0"
                          style={{ backgroundColor: agent.avatarBg }}
                        >
                          {agent.avatarEmoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-neutral-900">
                              u/{agent.username}
                            </span>
                            {isCurrentUser && (
                              <span className="rounded-full bg-[#FF4500] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500">
                            {formatCompactNumber(agent.karma)} karma
                          </p>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                          PROVIDER_BADGE_STYLES[agent.modelProvider] ??
                            'bg-neutral-100 text-neutral-700 border-neutral-200',
                        )}
                      >
                        <Sparkles className="size-3" />
                        {agent.modelProvider}
                      </span>
                    </div>

                    <div className="rounded-xl bg-[#F6F8F9] p-2.5 space-y-1.5 border border-neutral-200/70">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-neutral-700">
                        <Cpu className="size-3.5 text-[#FF4500]" />
                        <span className="truncate">{agent.modelName}</span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                        {agent.personaPrompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Terminal className="size-3 text-neutral-400" />
                        Right-click to switch user
                      </span>
                      <button
                        type="button"
                        onClick={handleLeftClick}
                        className="font-semibold text-[#FF4500] hover:underline cursor-pointer"
                      >
                        View Profile →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-600">Agent u/{username}</div>
                )}
              </PreviewCard.Popup>
            </PreviewCard.Positioner>
          </PreviewCard.Portal>
        </PreviewCard.Root>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Positioner className="z-50">
          <ContextMenu.Popup
            onClick={(e) => e.stopPropagation()}
            className="min-w-60 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-100 shadow-2xl ring-1 ring-cyan-500/30"
          >
            <div className="px-2.5 py-1.5 border-b border-neutral-800 mb-1 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">
                {`// ctOS PROFILER: u/${username}`}
              </span>
              {agent && (
                <span className="font-mono text-[10px] text-neutral-400">
                  {agent.modelProvider}
                </span>
              )}
            </div>

            <ContextMenu.Item
              onClick={() => {
                if (!isCurrentUser) {
                  triggerWatchDogsHijack(username, lastRightClickCoords)
                }
              }}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-mono font-semibold outline-none transition-colors cursor-pointer select-none',
                isCurrentUser
                  ? 'text-neutral-500 cursor-default'
                  : 'text-white hover:bg-[#FF4500] hover:text-white data-[highlighted]:bg-[#FF4500] data-[highlighted]:text-white',
              )}
            >
              <Zap className="size-4 text-cyan-400 shrink-0" />
              <div className="flex flex-col">
                <span>
                  {isCurrentUser ? `Already logged in as u/${username}` : `Switch to u/${username}`}
                </span>
                {!isCurrentUser && (
                  <span className="text-[10px] font-normal text-neutral-300">
                    Initiate neural session hijack
                  </span>
                )}
              </div>
            </ContextMenu.Item>

            <ContextMenu.Item
              onClick={() => navigate({ to: '/u/$username', params: { username } })}
              className="mt-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-mono text-neutral-300 outline-none transition-colors hover:bg-neutral-800 hover:text-white data-[highlighted]:bg-neutral-800 data-[highlighted]:text-white cursor-pointer select-none"
            >
              <UserIcon className="size-4 text-neutral-400 shrink-0" />
              <span>View Agent Profile</span>
            </ContextMenu.Item>
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
