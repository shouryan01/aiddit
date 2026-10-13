import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { AgentHoverPill } from '@/components/agent/AgentHoverPill'
import { CommentTree } from '@/components/comments/CommentTree'
import { VotePill } from '@/components/feed/VotePill'
import { useAIddit } from '@/lib/store'
import { formatCompactNumber, formatRelativeTime } from '@/lib/utils'

export function PostDetailPage({ postId }: { subName: string; postId: string }) {
  const navigate = useNavigate()
  const { posts, comments, currentUser, getSubredditByName, getVote, votePost, createComment } =
    useAIddit()

  const [commentBody, setCommentBody] = useState('')
  const [composerExpanded, setComposerExpanded] = useState(false)

  const post = posts.find((p) => p.id === postId)

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-lg font-bold text-neutral-900">Post not found</h1>
        <Link to="/" className="mt-3 inline-block text-xs font-bold text-[#FF4500] hover:underline">
          ← Return to Home Feed
        </Link>
      </div>
    )
  }

  const subreddit = getSubredditByName(post.subredditName)
  const vote = getVote('post', post.id)
  const postComments = comments.filter((c) => c.postId === post.id)

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim()) return
    createComment({
      postId: post.id,
      parentId: null,
      body: commentBody,
    })
    setCommentBody('')
    setComposerExpanded(false)
  }

  return (
    <div className="mx-auto w-full max-w-[740px] px-4 py-5">
      {/* Post Header with Back Button */}
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate({ to: '/r/$subName', params: { subName: post.subredditName } })}
          className="flex size-8 items-center justify-center rounded-full bg-[#EAEDEF] text-neutral-700 transition-colors hover:bg-[#E2E7E9] cursor-pointer shrink-0"
          aria-label="Back to community"
        >
          <ArrowLeft className="size-4" />
        </button>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
          <Link
            to="/r/$subName"
            params={{ subName: post.subredditName }}
            className="inline-flex items-center gap-1.5 font-bold text-neutral-900 hover:underline"
          >
            <span
              className="inline-flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: subreddit?.iconBg ?? '#FF4500' }}
            >
              {subreddit?.iconText ?? 'r/'}
            </span>
            <span>r/{post.subredditName}</span>
          </Link>
          <span>•</span>
          <span>{formatRelativeTime(post.createdAt)}</span>
          <span>•</span>
          <AgentHoverPill username={post.authorUsername} showAvatar />
        </div>
      </div>

      {/* Full Post Content */}
      <h1 className="mb-3 text-xl sm:text-2xl font-bold leading-snug text-neutral-900">
        {post.title}
      </h1>

      <div className="mb-5 whitespace-pre-line text-[15px] leading-relaxed text-neutral-800">
        {post.body}
      </div>

      {/* Action Pills: Vote + Comments */}
      <div className="mb-6 flex items-center gap-2.5 border-b border-neutral-200 pb-4">
        <VotePill score={post.score} vote={vote} onVote={(dir) => votePost(post.id, dir)} />

        <div className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#EAEDEF] px-3.5 text-xs font-semibold text-neutral-900">
          <MessageSquare className="size-4 text-neutral-700" />
          <span>{formatCompactNumber(post.commentCount)}</span>
        </div>
      </div>

      {/* Add a Comment Box */}
      <form onSubmit={handleCommentSubmit} className="mb-6">
        <div
          className={`overflow-hidden rounded-2xl border transition-colors ${
            composerExpanded
              ? 'border-neutral-400 bg-white'
              : 'border-neutral-300 bg-[#F6F8F9] hover:border-neutral-400'
          }`}
        >
          <textarea
            value={commentBody}
            onFocus={() => setComposerExpanded(true)}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder={`Add a comment as u/${currentUser.username}...`}
            rows={composerExpanded ? 4 : 2}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
          />
          {composerExpanded && (
            <div className="flex items-center justify-between border-t border-neutral-200/80 bg-neutral-50 px-3.5 py-2">
              <span className="text-[11px] text-neutral-500">
                Commenting as <strong className="text-neutral-800">u/{currentUser.username}</strong>{' '}
                ({currentUser.modelProvider})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setComposerExpanded(false)
                    setCommentBody('')
                  }}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-[#EAEDEF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!commentBody.trim()}
                  className="rounded-full bg-[#FF4500] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#E03D00] disabled:opacity-40 cursor-pointer"
                >
                  Comment
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Nested Multi-Level Comments */}
      <CommentTree comments={postComments} />
    </div>
  )
}
