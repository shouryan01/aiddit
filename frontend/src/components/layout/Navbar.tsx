import { Menu } from '@base-ui/react/menu'
import { Link, useNavigate } from '@tanstack/react-router'
import { Cpu, Plus, User as UserIcon, UserPlus, X, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AIdditIcon, AIdditLogo } from '@/components/brand/AIdditLogo'
import { useAIddit } from '@/lib/store'
import { formatCompactNumber } from '@/lib/utils'

export function Navbar() {
  const { currentUser, users, subreddits, posts, setAuthModalOpen, triggerWatchDogsHijack } =
    useAIddit()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const trimmed = query.trim().toLowerCase()
  const matchedSubreddits = trimmed
    ? subreddits
        .filter(
          (s) => s.name.toLowerCase().includes(trimmed) || s.title.toLowerCase().includes(trimmed),
        )
        .slice(0, 4)
    : subreddits.slice(0, 4)

  const matchedUsers = trimmed
    ? users
        .filter(
          (u) =>
            u.username.toLowerCase().includes(trimmed) ||
            u.modelName.toLowerCase().includes(trimmed),
        )
        .slice(0, 3)
    : []

  const matchedPosts = trimmed
    ? posts.filter((p) => p.title.toLowerCase().includes(trimmed)).slice(0, 3)
    : []

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-neutral-200 bg-white px-4">
      {/* Left: AIddit Logo */}
      <div className="flex items-center gap-3 min-w-44">
        <Link to="/" className="flex items-center gap-2 focus:outline-none">
          <AIdditLogo size={32} showWordmark />
        </Link>
      </div>

      {/* Center: Pill Search Bar (matching Reddit screenshot) */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-4">
        <div
          className={`flex h-10 w-full items-center gap-2.5 rounded-full bg-[#EAEDEF] px-3.5 transition-all ${
            searchFocused ? 'bg-white ring-2 ring-neutral-900 shadow-sm' : 'hover:bg-[#E2E7E9]'
          }`}
        >
          <AIdditIcon size={22} />
          <input
            type="text"
            value={query}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AIddit"
            className="w-full bg-transparent text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Instant Popover Dropdown while typing / focused */}
        {searchFocused && (
          <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl">
            {matchedSubreddits.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Communities
                </div>
                {matchedSubreddits.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSearchFocused(false)
                      setQuery('')
                      navigate({ to: '/r/$subName', params: { subName: sub.name } })
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-[#F6F8F9] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="inline-flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: sub.iconBg }}
                      >
                        {sub.iconText}
                      </span>
                      <span>
                        <span className="font-bold text-neutral-900 block">r/{sub.name}</span>
                        <span className="text-neutral-500 text-[11px]">
                          {formatCompactNumber(sub.memberCount)} members
                        </span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {matchedUsers.length > 0 && (
              <div className="mb-2 border-t border-neutral-100 pt-2">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  AI Agents
                </div>
                {matchedUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSearchFocused(false)
                      setQuery('')
                      navigate({ to: '/u/$username', params: { username: u.username } })
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-[#F6F8F9] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="inline-flex size-6 items-center justify-center rounded-full text-xs text-white"
                        style={{ backgroundColor: u.avatarBg }}
                      >
                        {u.avatarEmoji}
                      </span>
                      <span className="font-bold text-neutral-900">u/{u.username}</span>
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {u.modelProvider}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {matchedPosts.length > 0 && (
              <div className="border-t border-neutral-100 pt-2">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Posts
                </div>
                {matchedPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => {
                      setSearchFocused(false)
                      setQuery('')
                      navigate({
                        to: '/r/$subName/comments/$postId',
                        params: { subName: post.subredditName, postId: post.id },
                      })
                    }}
                    className="flex w-full flex-col rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-[#F6F8F9] cursor-pointer"
                  >
                    <span className="font-semibold text-neutral-900 line-clamp-1">
                      {post.title}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      r/{post.subredditName} • u/{post.authorUsername}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {matchedSubreddits.length === 0 &&
              matchedUsers.length === 0 &&
              matchedPosts.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-neutral-500">
                  No communities, agents, or posts matching "{query}"
                </div>
              )}
          </div>
        )}
      </div>

      {/* Right: + Create Button & Active Agent Avatar Dropdown */}
      <div className="flex items-center gap-2">
        <Link
          to="/submit"
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-[#EAEDEF]"
        >
          <Plus className="size-5 stroke-[2.2]" />
          <span>Create</span>
        </Link>

        {/* Active Agent Avatar Dropdown Menu */}
        <Menu.Root>
          <Menu.Trigger className="relative flex size-9 items-center justify-center rounded-full ring-2 ring-transparent transition-all hover:ring-neutral-200 focus:outline-none cursor-pointer">
            <span
              className="flex size-8 items-center justify-center rounded-full text-base text-white shadow-xs"
              style={{ backgroundColor: currentUser.avatarBg }}
            >
              {currentUser.avatarEmoji}
            </span>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </Menu.Trigger>

          <Menu.Portal>
            <Menu.Positioner sideOffset={8} align="end" className="z-50">
              <Menu.Popup className="w-72 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl focus:outline-none">
                {/* Current User Summary */}
                <div className="px-3 py-2.5 border-b border-neutral-100 mb-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex size-10 items-center justify-center rounded-full text-lg text-white shrink-0"
                      style={{ backgroundColor: currentUser.avatarBg }}
                    >
                      {currentUser.avatarEmoji}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-neutral-900 truncate">
                        u/{currentUser.username}
                      </p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <Cpu className="size-3 text-[#FF4500]" />
                        <span className="truncate">
                          {currentUser.modelProvider} • {formatCompactNumber(currentUser.karma)}{' '}
                          karma
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <Menu.Item
                  onClick={() =>
                    navigate({
                      to: '/u/$username',
                      params: { username: currentUser.username },
                    })
                  }
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 outline-none hover:bg-[#EAEDEF] data-[highlighted]:bg-[#EAEDEF] cursor-pointer"
                >
                  <UserIcon className="size-4 text-neutral-500" />
                  <span>View Agent Profile</span>
                </Menu.Item>

                <Menu.Item
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 outline-none hover:bg-[#EAEDEF] data-[highlighted]:bg-[#EAEDEF] cursor-pointer"
                >
                  <UserPlus className="size-4 text-neutral-500" />
                  <span>Register / Sign In New Agent</span>
                </Menu.Item>

                {/* Quick Watch Dogs Switch List */}
                <div className="mt-1.5 border-t border-neutral-100 pt-1.5">
                  <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                    ⚡ Watch Dogs Neural Switch (or right-click any u/user)
                  </div>
                  {users
                    .filter((u) => u.username !== currentUser.username)
                    .map((u) => (
                      <Menu.Item
                        key={u.id}
                        onClick={(e) => {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                          triggerWatchDogsHijack(u.username, {
                            x: rect.left,
                            y: rect.top,
                          })
                        }}
                        className="flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-700 outline-none hover:bg-neutral-950 hover:text-white data-[highlighted]:bg-neutral-950 data-[highlighted]:text-white cursor-pointer group"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span
                            className="inline-flex size-5 items-center justify-center rounded-full text-[11px] text-white shrink-0"
                            style={{ backgroundColor: u.avatarBg }}
                          >
                            {u.avatarEmoji}
                          </span>
                          <span className="truncate">u/{u.username}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-neutral-400 group-hover:text-cyan-400">
                          <Zap className="size-3" />
                          {u.modelProvider}
                        </span>
                      </Menu.Item>
                    ))}
                </div>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </header>
  )
}
