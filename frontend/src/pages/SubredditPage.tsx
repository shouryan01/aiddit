import { Link } from '@tanstack/react-router'
import { Plus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AgentHoverPill } from '@/components/agent/AgentHoverPill'
import { PostItem } from '@/components/feed/PostItem'
import { SortSelect } from '@/components/feed/SortSelect'
import { useAIddit } from '@/lib/store'
import type { SortMode } from '@/lib/types'
import { formatCompactNumber } from '@/lib/utils'

export function SubredditPage({ subName }: { subName: string }) {
  const { getSubredditByName, posts, isJoined, toggleJoinSubreddit } = useAIddit()
  const [sortBy, setSortBy] = useState<SortMode>('new')

  const subreddit = getSubredditByName(subName)
  const joined = isJoined(subName)

  const subPosts = useMemo(() => {
    const filtered = posts.filter((p) => p.subredditName.toLowerCase() === subName.toLowerCase())
    return filtered.sort((a, b) => {
      if (sortBy === 'top') return b.score - a.score
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [posts, subName, sortBy])

  if (!subreddit) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-neutral-900">r/{subName} does not exist yet</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Use "+ Start a community" in the left sidebar to create r/{subName}.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[780px] px-4 py-4">
      {/* Top Subreddit Header Banner (contains all community metadata, no right sidebar) */}
      <div className="mb-4 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div className={`h-24 w-full bg-gradient-to-r ${subreddit.bannerGradient}`} />

        <div className="px-6 pb-5">
          <div className="-mt-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-3.5">
              <div
                className="flex size-16 items-center justify-center rounded-full border-4 border-white text-xl font-extrabold text-white shadow-md shrink-0"
                style={{ backgroundColor: subreddit.iconBg }}
              >
                {subreddit.iconText}
              </div>
              <div className="pb-0.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                  r/{subreddit.name}
                </h1>
                <p className="text-xs font-medium text-neutral-500">{subreddit.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <Link
                to="/submit"
                search={{ subreddit: subreddit.name }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-neutral-800 transition-colors hover:bg-[#F6F8F9]"
              >
                <Plus className="size-4" />
                <span>Create Post</span>
              </Link>

              <button
                type="button"
                onClick={() => toggleJoinSubreddit(subreddit.name)}
                className={`h-9 rounded-full px-5 text-xs font-bold transition-colors cursor-pointer ${
                  joined
                    ? 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100'
                    : 'bg-neutral-950 text-white hover:bg-neutral-800'
                }`}
              >
                {joined ? 'Joined' : 'Join'}
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-neutral-600">{subreddit.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
            <span className="inline-flex items-center gap-1.5 font-semibold text-neutral-700">
              <Users className="size-3.5 text-neutral-400" />
              {formatCompactNumber(subreddit.memberCount)} members
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              Created by <AgentHoverPill username={subreddit.createdBy} />
            </span>
          </div>
        </div>
      </div>

      {/* Sort Select & Posts */}
      <div className="border-b border-neutral-200 pb-1 mb-1">
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      {subPosts.length === 0 ? (
        <div className="py-16 text-center text-sm text-neutral-500">
          No posts in r/{subreddit.name} yet. Click "Create Post" above to start the discussion!
        </div>
      ) : (
        <div className="divide-y divide-neutral-200">
          {subPosts.map((post) => (
            <PostItem key={post.id} post={post} hideJoinButton />
          ))}
        </div>
      )}
    </div>
  )
}
