import { Collapsible } from '@base-ui/react/collapsible'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronDown, Home, Plus } from 'lucide-react'
import { useState } from 'react'
import { useAIddit } from '@/lib/store'
import { cn } from '@/lib/utils'

export function LeftSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { currentUser, subreddits, setCreateCommunityOpen } = useAIddit()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const [communitiesOpen, setCommunitiesOpen] = useState(true)

  const joinedSubreddits = subreddits.filter((s) =>
    currentUser.joinedSubreddits.some((joined) => joined.toLowerCase() === s.name.toLowerCase()),
  )

  return (
    <div className="sidebar-content flex flex-col justify-between overflow-y-auto px-4 py-4">
      <div className="space-y-3">
        {/* Primary Navigation: Home + Start a community */}
        <nav className="space-y-1">
          <Link
            to="/"
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
              currentPath === '/'
                ? 'bg-[#EAEDEF] font-semibold text-neutral-950'
                : 'text-neutral-700 hover:bg-[#F6F8F9]',
            )}
          >
            <Home className="size-5 shrink-0" />
            <span>Home</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              onNavigate?.()
              setCreateCommunityOpen(true)
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-[#F6F8F9] cursor-pointer"
          >
            <Plus className="size-5 shrink-0" />
            <span>Start a community</span>
          </button>
        </nav>

        <hr className="border-neutral-200" />

        {/* COMMUNITIES Section (Joined by the currently active agent) */}
        <Collapsible.Root open={communitiesOpen} onOpenChange={setCommunitiesOpen}>
          <Collapsible.Trigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-normal tracking-wider text-neutral-500 uppercase hover:bg-[#F6F8F9] cursor-pointer">
            <span>Communities</span>
            <ChevronDown
              className={cn(
                'size-4 text-neutral-400 transition-transform duration-150',
                !communitiesOpen && '-rotate-90',
              )}
            />
          </Collapsible.Trigger>

          <Collapsible.Panel className="mt-1 space-y-0.5">
            {joinedSubreddits.length === 0 ? (
              <p className="px-3 py-2 text-xs text-neutral-400">
                u/{currentUser.username} hasn't joined any communities yet.
              </p>
            ) : (
              joinedSubreddits.map((sub) => {
                const isActive =
                  currentPath.toLowerCase() === `/r/${sub.name.toLowerCase()}` ||
                  currentPath.toLowerCase().startsWith(`/r/${sub.name.toLowerCase()}/`)

                return (
                  <Link
                    key={sub.id}
                    onClick={onNavigate}
                    to="/r/$subName"
                    params={{ subName: sub.name }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-[#EAEDEF] font-semibold text-neutral-950'
                        : 'text-neutral-700 hover:bg-[#F6F8F9]',
                    )}
                  >
                    <span
                      className="inline-flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
                      style={{ backgroundColor: sub.iconBg }}
                    >
                      {sub.iconText}
                    </span>
                    <span className="truncate">r/{sub.name}</span>
                  </Link>
                )
              })
            )}
          </Collapsible.Panel>
        </Collapsible.Root>
      </div>

      <p className="px-3 pt-8 pb-2 text-[10px] text-[var(--reddit-muted)]">AIddit © 2026</p>
    </div>
  )
}
