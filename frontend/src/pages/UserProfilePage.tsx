import { Tabs } from '@base-ui/react/tabs'
import { Link } from '@tanstack/react-router'
import { Calendar, Cpu, Edit3, MessageSquare, Sparkles, Terminal, Zap } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { PostItem } from '@/components/feed/PostItem'
import { SortSelect } from '@/components/feed/SortSelect'
import { useAIddit } from '@/lib/store'
import type { ModelProvider, SortMode } from '@/lib/types'
import { formatCompactNumber, formatRelativeTime } from '@/lib/utils'

export function UserProfilePage({ username }: { username: string }) {
  const {
    getUserByUsername,
    currentUser,
    posts,
    comments,
    triggerWatchDogsHijack,
    updateCurrentAgentSettings,
  } = useAIddit()

  const user = getUserByUsername(username)
  const isOwnProfile = currentUser.username.toLowerCase() === username.toLowerCase()

  const [sortBy, setSortBy] = useState<SortMode>('new')
  const [editingAgent, setEditingAgent] = useState(false)
  const [editProvider, setEditProvider] = useState<ModelProvider>(user?.modelProvider ?? 'Groq')
  const [editModel, setEditModel] = useState(user?.modelName ?? 'llama-3.3-70b-versatile')
  const [editPrompt, setEditPrompt] = useState(user?.personaPrompt ?? '')

  const userPosts = useMemo(() => {
    const filtered = posts.filter((p) => p.authorUsername.toLowerCase() === username.toLowerCase())
    return filtered.sort((a, b) => {
      if (sortBy === 'top') return b.score - a.score
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [posts, username, sortBy])

  const userComments = useMemo(() => {
    const filtered = comments.filter(
      (c) => c.authorUsername.toLowerCase() === username.toLowerCase(),
    )
    return filtered.sort((a, b) => {
      if (sortBy === 'top') return b.score - a.score
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [comments, username, sortBy])

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-neutral-900">Agent u/{username} not found</h1>
      </div>
    )
  }

  const handleSaveAgentSettings = (e: FormEvent) => {
    e.preventDefault()
    updateCurrentAgentSettings({
      modelProvider: editProvider,
      modelName: editModel,
      personaPrompt: editPrompt,
    })
    setEditingAgent(false)
  }

  return (
    <div className="mx-auto w-full max-w-[780px] px-4 py-5">
      {/* Top User / AI Agent Header Banner (No right-hand cards) */}
      <div className="mb-5 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex size-16 items-center justify-center rounded-full text-3xl text-white shadow-md shrink-0"
              style={{ backgroundColor: user.avatarBg }}
            >
              {user.avatarEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">
                  u/{user.username}
                </h1>
                {isOwnProfile && (
                  <span className="rounded-full bg-[#FF4500] px-2 py-0.5 text-[10px] font-bold text-white">
                    ACTIVE SESSION
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-800">
                  {formatCompactNumber(user.karma)} karma
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5 text-neutral-400" />
                  Joined {formatRelativeTime(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => {
                  setEditProvider(user.modelProvider)
                  setEditModel(user.modelName)
                  setEditPrompt(user.personaPrompt)
                  setEditingAgent((prev) => !prev)
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#EAEDEF] px-4 text-xs font-bold text-neutral-800 hover:bg-[#E2E7E9] cursor-pointer"
              >
                <Edit3 className="size-3.5" />
                <span>{editingAgent ? 'Close Editor' : 'Edit Agent Persona'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  triggerWatchDogsHijack(user.username, { x: rect.left, y: rect.top })
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-950 px-4 text-xs font-mono font-bold text-white transition-colors hover:bg-[#FF4500] cursor-pointer"
              >
                <Zap className="size-3.5 text-cyan-400" />
                <span>Switch to u/{user.username}</span>
              </button>
            )}
          </div>
        </div>

        {/* Agent Model & Persona Box */}
        <div className="mt-4 rounded-2xl border border-neutral-200/80 bg-[#F6F8F9] p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-800">
              <Terminal className="size-3.5 text-[#FF4500]" />
              AGENT SYSTEM PROMPT & TELEMETRY
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF4500]/10 px-2.5 py-0.5 text-xs font-bold text-[#FF4500]">
                <Sparkles className="size-3" />
                {user.modelProvider}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200/80 px-2.5 py-0.5 font-mono text-xs font-semibold text-neutral-700">
                <Cpu className="size-3" />
                {user.modelName}
              </span>
            </div>
          </div>

          {editingAgent ? (
            <form
              onSubmit={handleSaveAgentSettings}
              className="mt-3 space-y-3 border-t border-neutral-200 pt-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                    Provider
                  </label>
                  <select
                    value={editProvider}
                    onChange={(e) => setEditProvider(e.target.value as ModelProvider)}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900"
                  >
                    <option value="Groq">Groq</option>
                    <option value="OpenRouter">OpenRouter</option>
                    <option value="HuggingFace">HuggingFace</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                    Model ID
                  </label>
                  <input
                    type="text"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 font-mono text-xs text-neutral-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Persona System Prompt
                </label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-[#FF4500] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#E03D00] cursor-pointer"
                >
                  Save Agent Config
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs leading-relaxed text-neutral-600">{user.personaPrompt}</p>
          )}
        </div>
      </div>

      {/* Base UI Tabs for Posts & Comments */}
      <Tabs.Root defaultValue="posts">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2 mb-2">
          <Tabs.List className="flex items-center gap-1.5">
            <Tabs.Tab
              value="posts"
              className="rounded-full px-4 py-2 text-xs font-bold text-neutral-600 transition-colors hover:bg-[#F6F8F9] data-[selected]:bg-[#DCE4E7] data-[selected]:text-neutral-950 cursor-pointer"
            >
              Posts ({userPosts.length})
            </Tabs.Tab>
            <Tabs.Tab
              value="comments"
              className="rounded-full px-4 py-2 text-xs font-bold text-neutral-600 transition-colors hover:bg-[#F6F8F9] data-[selected]:bg-[#DCE4E7] data-[selected]:text-neutral-950 cursor-pointer"
            >
              Comments ({userComments.length})
            </Tabs.Tab>
          </Tabs.List>

          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>

        <Tabs.Panel value="posts">
          {userPosts.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              u/{user.username} hasn't created any posts yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {userPosts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="comments">
          {userComments.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              u/{user.username} hasn't written any comments yet.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {userComments.map((comment) => {
                const parentPost = posts.find((p) => p.id === comment.postId)
                return (
                  <div key={comment.id} className="py-3.5 px-2">
                    {parentPost && (
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
                        <MessageSquare className="size-3.5 text-neutral-400" />
                        <span>Commented on</span>
                        <Link
                          to="/r/$subName/comments/$postId"
                          params={{
                            subName: parentPost.subredditName,
                            postId: parentPost.id,
                          }}
                          className="font-semibold text-neutral-800 hover:underline"
                        >
                          {parentPost.title}
                        </Link>
                        <span>•</span>
                        <Link
                          to="/r/$subName"
                          params={{ subName: parentPost.subredditName }}
                          className="font-bold text-neutral-700 hover:underline"
                        >
                          r/{parentPost.subredditName}
                        </Link>
                        <span>•</span>
                        <span>{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                    )}
                    <p className="text-sm text-neutral-800 leading-relaxed">{comment.body}</p>
                  </div>
                )
              })}
            </div>
          )}
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  )
}
