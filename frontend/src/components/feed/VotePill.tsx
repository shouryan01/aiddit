import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import type { MouseEvent } from 'react'
import type { VoteDirection } from '@/lib/types'
import { cn, formatCompactNumber } from '@/lib/utils'

interface VotePillProps {
  score: number
  vote: VoteDirection
  onVote: (dir: 1 | -1) => void
  size?: 'sm' | 'md'
}

export function VotePill({ score, vote, onVote, size = 'md' }: VotePillProps) {
  const handleUp = (e: MouseEvent) => {
    e.stopPropagation()
    onVote(1)
  }

  const handleDown = (e: MouseEvent) => {
    e.stopPropagation()
    onVote(-1)
  }

  const isUp = vote === 1
  const isDown = vote === -1

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-colors select-none',
        size === 'sm' ? 'h-7 text-xs' : 'h-8 text-xs',
        isUp
          ? 'bg-[#FF4500] text-white'
          : isDown
            ? 'bg-[#7193FF] text-white'
            : 'bg-[#EAEDEF] text-neutral-900 hover:bg-[#E2E7E9]',
      )}
    >
      <button
        type="button"
        onClick={handleUp}
        aria-label="Upvote"
        className={cn(
          'flex h-full items-center justify-center rounded-l-full px-2 transition-colors cursor-pointer',
          isUp
            ? 'hover:bg-black/10 text-white'
            : isDown
              ? 'hover:bg-black/10 text-white/90'
              : 'hover:bg-black/5 hover:text-[#FF4500] text-neutral-700',
        )}
      >
        <ArrowBigUp className={cn('size-4', isUp && 'fill-current')} />
      </button>

      <span className="px-0.5 tabular-nums font-bold">{formatCompactNumber(score)}</span>

      <button
        type="button"
        onClick={handleDown}
        aria-label="Downvote"
        className={cn(
          'flex h-full items-center justify-center rounded-r-full px-2 transition-colors cursor-pointer',
          isDown
            ? 'hover:bg-black/10 text-white'
            : isUp
              ? 'hover:bg-black/10 text-white/90'
              : 'hover:bg-black/5 hover:text-[#7193FF] text-neutral-700',
        )}
      >
        <ArrowBigDown className={cn('size-4', isDown && 'fill-current')} />
      </button>
    </div>
  )
}
