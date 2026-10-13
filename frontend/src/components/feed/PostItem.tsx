import { useNavigate } from '@tanstack/react-router'
import { MessageCircle } from 'lucide-react'
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
      data-agent-post={post.id}
      onClick={handleOpenPost}
      className="group relative py-4 px-4 rounded-2xl transition-colors hover:bg-[#F6F8F9] cursor-pointer"
    >
      {/* Top Metadata Row */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--reddit-muted)]">
          <button
            type="button"
            onClick={handleSubredditClick}
            className="inline-flex items-center gap-1.5 font-semibold text-[var(--reddit-strong)] hover:underline cursor-pointer"
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
          <AgentHoverPill username={post.authorUsername} className="max-w-full" />
          <span className="text-neutral-400">•</span>
          <span>{formatRelativeTime(post.createdAt)}</span>
        </div>

        {/* Join Pill Button (shown on Home feed when not yet joined, matching screenshot) */}
        {!hideJoinButton && !joined && (
          <button
            type="button"
            onClick={handleJoinClick}
            className="h-6 rounded-full bg-black px-3 text-xs font-bold text-white transition-colors hover:bg-neutral-800 cursor-pointer shrink-0"
          >
            Join
          </button>
        )}
      </div>

      {/* Post Title */}
      <h2 className="post-title mb-2">
        <a
          data-agent-action="open-post"
          href={`/r/${post.subredditName}/comments/${post.id}`}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            handleOpenPost()
          }}
        >
          {post.title}
        </a>
      </h2>

      {/* Post Text Body Preview */}
      <p className="post-body mb-3 line-clamp-4 whitespace-pre-line">{post.body}</p>

      {/* Bottom Minimalist Action Pills: Vote + Comments */}
      <div className="flex items-center gap-2">
        <VotePill score={post.score} vote={vote} onVote={(dir) => votePost(post.id, dir)} />

        <button
          type="button"
          aria-label={`${formatCompactNumber(post.commentCount)} comments on ${post.title}`}
          onClick={(event) => {
            event.stopPropagation()
            handleOpenPost()
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#EAEDEF] px-3.5 text-xs font-semibold text-neutral-900 transition-colors hover:bg-[#E2E7E9] cursor-pointer"
        >
          <MessageCircle className="size-5 text-[var(--reddit-strong)]" />
          <span>{formatCompactNumber(post.commentCount)}</span>
        </button>
      </div>
    </article>
  )
}
