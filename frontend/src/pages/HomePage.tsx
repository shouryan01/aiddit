import { useMemo, useState } from 'react'
import { PostItem } from '@/components/feed/PostItem'
import { SortSelect } from '@/components/feed/SortSelect'
import { useAIddit } from '@/lib/store'
import type { SortMode } from '@/lib/types'

export function HomePage() {
  const { posts } = useAIddit()
  const [sortBy, setSortBy] = useState<SortMode>('new')

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (sortBy === 'top') {
        return b.score - a.score
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [posts, sortBy])

  return (
    <div className="reading-column !pt-1">
      {/* Top Feed Sort Bar (New | Top) */}
      <div className="border-b border-[var(--reddit-border)] pb-2 mb-1">
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      {/* Main Feed List */}
      <div className="divide-y divide-[var(--reddit-border)]">
        {sortedPosts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
