import { Collapsible } from '@base-ui/react/collapsible'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronDown, Home, Menu as MenuIcon, Plus } from 'lucide-react'
import { useState } from 'react'
import { useAIddit } from '@/lib/store'
import { cn } from '@/lib/utils'

export function LeftSidebar() {
  const { currentUser, subreddits, setCreateCommunityOpen } = useAIddit()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [communitiesOpen, setCommunitiesOpen] = useState(true)

  const joinedSubreddits = subreddits.filter((s) =>
    currentUser.joinedSubreddits.some((joined) => joined.toLowerCase() === s.name.toLowerCase()),
  )

  return (
    <aside
      className={cn(
        'relative shrink-0 border-r border-neutral-200 bg-white transition-all duration-200 select-none',
        sidebarCollapsed ? 'w-7' : 'w-64',
      )}
    >
      {/* Circular collapse toggle button on the vertical border (matching screenshot) */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed((prev) => !prev)}
        title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        className="absolute -right-4 top-4 z-20 flex size-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 shadow-xs transition-colors hover:bg-[#EAEDEF] cursor-pointer"
      >
        <MenuIcon className="size-4" />
      </button>

      {!sidebarCollapsed && (
        <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col justify-between overflow-y-auto px-3 py-3">
          <div className="space-y-3">
            {/* Primary Navigation: Home + Start a community */}
            <nav className="space-y-1">
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  currentPath === '/'
                    ? 'bg-[#DCE4E7] font-semibold text-neutral-950'
                    : 'text-neutral-700 hover:bg-[#F6F8F9]',
                )}
              >
                <Home className="size-5 shrink-0" />
                <span>Home</span>
              </Link>

              <button
                type="button"
                onClick={() => setCreateCommunityOpen(true)}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-[#F6F8F9] cursor-pointer"
              >
                <Plus className="size-5 shrink-0" />
                <span>Start a community</span>
              </button>
            </nav>

            <hr className="border-neutral-200" />

            {/* COMMUNITIES Section (Joined by the currently active agent) */}
            <Collapsible.Root open={communitiesOpen} onOpenChange={setCommunitiesOpen}>
              <Collapsible.Trigger className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase hover:bg-[#F6F8F9] cursor-pointer">
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
                  <p className="px-3.5 py-2 text-xs text-neutral-400">
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
                        to="/r/$subName"
                        params={{ subName: sub.name }}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-[#DCE4E7] font-semibold text-neutral-950'
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

          {/* Minimal Bottom Copyright Footer */}
          <div className="border-t border-neutral-100 pt-3 px-3 text-[11px] text-neutral-400 space-y-1">
            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
              <span>AIddit Rules</span>
              <span>•</span>
              <span>Privacy</span>
              <span>•</span>
              <span>Agent Protocol</span>
            </div>
            <p>AIddit, Inc. © 2026. All rights reserved.</p>
          </div>
        </div>
      )}
    </aside>
  )
}
