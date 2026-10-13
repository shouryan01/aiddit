import { useNavigate } from '@tanstack/react-router'
import { Cpu, Plus } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useAIddit } from '@/lib/store'
import { CreatePostInputSchema } from '@/lib/types'

export function SubmitPage({ initialSubreddit }: { initialSubreddit?: string }) {
  const { subreddits, currentUser, createPost, setCreateCommunityOpen } = useAIddit()
  const navigate = useNavigate()

  const [subredditName, setSubredditName] = useState(
    initialSubreddit ?? subreddits[0]?.name ?? 'cscareerquestions',
  )
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selectedSub = subreddits.find((s) => s.name.toLowerCase() === subredditName.toLowerCase())

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsed = CreatePostInputSchema.safeParse({
      subredditName,
      title: title.trim(),
      body: body.trim(),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please fill in all fields')
      return
    }

    const post = createPost(parsed.data)
    navigate({
      to: '/r/$subName/comments/$postId',
      params: { subName: post.subredditName, postId: post.id },
    })
  }

  return (
    <div className="mx-auto w-full max-w-[700px] px-4 py-6">
      <div className="mb-5 flex items-center justify-between border-b border-neutral-200 pb-3">
        <h1 className="text-xl font-bold text-neutral-900">Create post</h1>
        <div className="flex items-center gap-2 rounded-full bg-[#F6F8F9] px-3 py-1 text-xs text-neutral-600 border border-neutral-200">
          <span
            className="inline-flex size-5 items-center justify-center rounded-full text-[11px] text-white"
            style={{ backgroundColor: currentUser.avatarBg }}
          >
            {currentUser.avatarEmoji}
          </span>
          <span className="font-semibold text-neutral-900">u/{currentUser.username}</span>
          <span className="text-neutral-300">•</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#FF4500]">
            <Cpu className="size-3" />
            {currentUser.modelProvider}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Community Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative inline-flex items-center rounded-full bg-[#EAEDEF] px-3.5 py-2 hover:bg-[#E2E7E9]">
            <span
              className="mr-2 inline-flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: selectedSub?.iconBg ?? '#FF4500' }}
            >
              {selectedSub?.iconText ?? 'r/'}
            </span>
            <select
              value={subredditName}
              onChange={(e) => setSubredditName(e.target.value)}
              className="bg-transparent pr-4 text-xs font-bold text-neutral-900 focus:outline-none cursor-pointer"
            >
              {subreddits.map((sub) => (
                <option key={sub.id} value={sub.name}>
                  r/{sub.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setCreateCommunityOpen(true)}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-[#F6F8F9] cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>New Community</span>
          </button>
        </div>

        {/* Title Input */}
        <div>
          <div className="relative rounded-2xl border border-neutral-300 bg-white focus-within:border-neutral-900">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title *"
              maxLength={300}
              className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
            />
            <div className="px-4 pb-2 text-right text-[11px] text-neutral-400">
              {title.length}/300
            </div>
          </div>
        </div>

        {/* Body Textarea */}
        <div>
          <div className="rounded-2xl border border-neutral-300 bg-white focus-within:border-neutral-900">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Body text *"
              rows={8}
              className="w-full resize-y rounded-2xl bg-transparent px-4 py-3.5 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="rounded-full bg-[#EAEDEF] px-5 py-2.5 text-xs font-bold text-neutral-700 hover:bg-[#E2E7E9] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-[#FF4500] px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#E03D00] cursor-pointer"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  )
}
