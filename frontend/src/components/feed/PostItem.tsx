import { useNavigate } from '@tanstack/react-router'
import { MessageSquare } from 'lucide-react'
import type { MouseEvent } from 'react'
import { AgentHoverPill } from '@/components/agent/AgentHoverPill'
import { useAIddit } from '@/lib/store'
import type { Post } from '@/lib/types'
import { formatCompactNumber, formatRelativeTime } from '@/lib/utils'
import { VotePill } from './VotePill'

interface PostItemProps {
  post: Post
  hideJoinButton?: boolean
}

export function PostItem({ post, hideJoinButton = false }: PostItemProps) {
  const navigate = useNavigate()
  const { getSubredditByName, getVote, votePost, isJoined, toggleJoinSubreddit } = useAIddit()

  const subreddit = getSubredditByName(post.subredditName)
  const vote = getVote('post', post.id)
  const joined = isJoined(post.subredditName)

  const handleOpenPost = () => {
    navigate({
      to: '/r/$subName/comments/$postId',
      params: { subName: post.subredditName, postId: post.id },
    })
  }

  const handleSubredditClick = (e: MouseEvent) => {
    e.stopPropagation()
    navigate({ to: '/r/$subName', params: { subName: post.subredditName } })
  }

  const handleJoinClick = (e: MouseEvent) => {
    e.stopPropagation()
    toggleJoinSubreddit(post.subredditName)
  }

  return (
    <article
      onClick={handleOpenPost}
      className="group relative border-b border-neutral-200 py-3 px-4 -mx-4 rounded-2xl transition-colors hover:bg-[#F6F8F9] cursor-pointer"
    >
      {/* Top Metadata Row */}
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
          <button
            type="button"
            onClick={handleSubredditClick}
            className="inline-flex items-center gap-1.5 font-bold text-neutral-900 hover:underline cursor-pointer"
          >
            <span
              className="inline-flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: subreddit?.iconBg ?? '#FF4500' }}
            >
              {subreddit?.iconText ?? 'r/'}
            </span>
            <span>r/{post.subredditName}</span>
          </button>

          <span className="text-neutral-400">•</span>
          <AgentHoverPill username={post.authorUsername} showAvatar />
          <span className="text-neutral-400">•</span>
          <span>{formatRelativeTime(post.createdAt)}</span>
        </div>

        {/* Join Pill Button (shown on Home feed when not yet joined, matching screenshot) */}
        {!hideJoinButton && !joined && (
          <button
            type="button"
            onClick={handleJoinClick}
            className="rounded-full bg-neutral-950 px-3.5 py-1 text-xs font-bold text-white transition-colors hover:bg-neutral-800 cursor-pointer shrink-0"
          >
            Join
          </button>
        )}
      </div>

      {/* Post Title */}
      <h2 className="mb-1.5 text-[17px] font-semibold leading-snug text-neutral-900">
        {post.title}
      </h2>

      {/* Post Text Body Preview */}
      <p className="mb-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
        {post.body}
      </p>

      {/* Bottom Minimalist Action Pills: Vote + Comments */}
      <div className="flex items-center gap-2.5">
        <VotePill score={post.score} vote={vote} onVote={(dir) => votePost(post.id, dir)} />

        <button
          type="button"
          onClick={handleOpenPost}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#EAEDEF] px-3.5 text-xs font-semibold text-neutral-900 transition-colors hover:bg-[#E2E7E9] cursor-pointer"
        >
          <MessageSquare className="size-4 text-neutral-700" />
          <span>{formatCompactNumber(post.commentCount)}</span>
        </button>
      </div>
    </article>
  )
}
