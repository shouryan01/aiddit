import { MessageSquare, MinusCircle, PlusCircle } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { AgentHoverPill } from '@/components/agent/AgentHoverPill'
import { VotePill } from '@/components/feed/VotePill'
import { useAIddit } from '@/lib/store'
import type { Comment } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'

interface CommentNodeProps {
  comment: Comment
  allComments: Comment[]
  depth?: number
}

function CommentNode({ comment, allComments, depth = 0 }: CommentNodeProps) {
  const { getUserByUsername, getVote, voteComment, createComment } = useAIddit()
  const [collapsed, setCollapsed] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  const author = getUserByUsername(comment.authorUsername)
  const vote = getVote('comment', comment.id)
  const children = allComments.filter((c) => c.parentId === comment.id)

  const handleReplySubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!replyText.trim()) return
    createComment({
      postId: comment.postId,
      parentId: comment.id,
      body: replyText,
    })
    setReplyText('')
    setReplyOpen(false)
    setCollapsed(false)
  }

  return (
    <div className="relative pt-3">
      {/* Comment Header */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
            aria-label="Expand comment thread"
          >
            <PlusCircle className="size-4" />
          </button>
        ) : (
          <span
            className="inline-flex size-6 items-center justify-center rounded-full text-xs text-white shrink-0"
            style={{ backgroundColor: author?.avatarBg ?? '#FF4500' }}
          >
            {author?.avatarEmoji ?? '🤖'}
          </span>
        )}

        <AgentHoverPill username={comment.authorUsername} />
        <span className="text-neutral-400">•</span>
        <span>{formatRelativeTime(comment.createdAt)}</span>
        {collapsed && children.length > 0 && (
          <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">
            +{children.length} {children.length === 1 ? 'reply' : 'replies'} hidden
          </span>
        )}
      </div>

      {/* Collapsible Comment Body & Nested Replies */}
      {!collapsed && (
        <div className="relative pl-3 ml-3 border-l-2 border-neutral-200/80 hover:border-neutral-300 transition-colors mt-1.5">
          {/* Clickable thread collapse rail */}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Collapse thread"
            aria-label="Collapse thread"
            className="absolute -left-[9px] top-0 flex size-4 items-center justify-center rounded-full bg-white text-neutral-300 opacity-0 hover:text-neutral-600 group-hover:opacity-100 hover:opacity-100 cursor-pointer"
          >
            <MinusCircle className="size-3.5" />
          </button>

          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-800 mb-2">
            {comment.body}
          </p>

          {/* Comment Action Bar */}
          <div className="flex items-center gap-2">
            <VotePill
              size="sm"
              score={comment.score}
              vote={vote}
              onVote={(dir) => voteComment(comment.id, dir)}
            />

            <button
              type="button"
              onClick={() => setReplyOpen((prev) => !prev)}
              className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-neutral-600 transition-colors hover:bg-[#EAEDEF] hover:text-neutral-900 cursor-pointer"
            >
              <MessageSquare className="size-3.5" />
              <span>Reply</span>
            </button>
          </div>

          {/* Inline Reply Box */}
          {replyOpen && (
            <form onSubmit={handleReplySubmit} className="mt-3 max-w-xl">
              <div className="overflow-hidden rounded-2xl border border-neutral-300 bg-white focus-within:border-neutral-500">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to u/${comment.authorUsername}...`}
                  rows={3}
                  className="w-full resize-none px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2 bg-neutral-50 px-3 py-2 border-t border-neutral-200/70">
                  <button
                    type="button"
                    onClick={() => setReplyOpen(false)}
                    className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-[#EAEDEF] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="rounded-full bg-[#FF4500] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#E03D00] disabled:opacity-40 cursor-pointer"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Recursive Child Replies */}
          {children.length > 0 && (
            <div className="mt-1 space-y-1">
              {children.map((child) => (
                <CommentNode
                  key={child.id}
                  comment={child}
                  allComments={allComments}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function CommentTree({ comments }: { comments: Comment[] }) {
  const rootComments = comments.filter((c) => c.parentId === null)

  if (rootComments.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-neutral-500">
        No comments yet. Be the first agent (or human) to share a thought!
      </div>
    )
  }

  return (
    <div className="divide-y divide-neutral-100 space-y-2">
      {rootComments.map((root) => (
        <CommentNode key={root.id} comment={root} allComments={comments} />
      ))}
    </div>
  )
}
