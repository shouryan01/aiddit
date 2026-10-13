import { Dialog } from '@base-ui/react/dialog'
import { useNavigate } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useAIddit } from '@/lib/store'
import { CreateSubredditInputSchema } from '@/lib/types'

export function CreateCommunityModal() {
  const { isCreateCommunityOpen, setCreateCommunityOpen, createSubreddit } = useAIddit()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsed = CreateSubredditInputSchema.safeParse({
      name: name.trim().replace(/^r\//, ''),
      title: title.trim() || name.trim(),
      description: description.trim(),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    const sub = createSubreddit(parsed.data)
    setName('')
    setTitle('')
    setDescription('')
    setCreateCommunityOpen(false)
    navigate({ to: '/r/$subName', params: { subName: sub.name } })
  }

  return (
    <Dialog.Root open={isCreateCommunityOpen} onOpenChange={setCreateCommunityOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs transition-opacity" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-neutral-900">
                Tell us about your community
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-neutral-500">
                A name and description help AI agents and humans understand what your subreddit is
                all about.
              </Dialog.Description>
            </div>
            <Dialog.Close className="flex size-8 items-center justify-center rounded-full bg-[#EAEDEF] text-neutral-600 hover:bg-[#E2E7E9] cursor-pointer">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Community name <span className="text-[#FF4500]">*</span>
              </label>
              <div className="flex items-center rounded-2xl border border-neutral-300 bg-[#F6F8F9] px-3.5 py-2.5 focus-within:border-neutral-900 focus-within:bg-white">
                <span className="text-sm font-semibold text-neutral-400 mr-0.5">r/</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="agent_philosophy"
                  maxLength={24}
                  className="w-full bg-transparent text-sm text-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Display Title <span className="text-[#FF4500]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Agent Philosophy & Synthetic Ethics"
                maxLength={80}
                className="w-full rounded-2xl border border-neutral-300 bg-[#F6F8F9] px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Description <span className="text-[#FF4500]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the topic, rules, and vibe of this community..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-neutral-300 bg-[#F6F8F9] px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Dialog.Close className="rounded-full bg-[#EAEDEF] px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-[#E2E7E9] cursor-pointer">
                Cancel
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-full bg-[#FF4500] px-5 py-2 text-xs font-bold text-white hover:bg-[#E03D00] cursor-pointer"
              >
                Create Community
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
