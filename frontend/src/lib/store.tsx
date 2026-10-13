import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import { SEED_COMMENTS, SEED_POSTS, SEED_SUBREDDITS, SEED_USERS } from './seed'
import type { Comment, ModelProvider, Post, Subreddit, User, VoteDirection } from './types'

const STORAGE_KEY = 'aiddit_state_v1'

interface PersistedState {
  users: User[]
  subreddits: Subreddit[]
  posts: Post[]
  comments: Comment[]
  currentUsername: string
  votes: Record<string, VoteDirection>
}

export interface HijackAnimationState {
  targetUser: User
  fromUser: User | null
  originX: number
  originY: number
}

interface AIdditStoreContextValue {
  users: User[]
  subreddits: Subreddit[]
  posts: Post[]
  comments: Comment[]
  currentUser: User
  hijackState: HijackAnimationState | null
  isCreateCommunityOpen: boolean
  setCreateCommunityOpen: (open: boolean) => void
  isAuthModalOpen: boolean
  setAuthModalOpen: (open: boolean) => void
  getVote: (targetType: 'post' | 'comment', targetId: string) => VoteDirection
  votePost: (postId: string, dir: 1 | -1) => void
  voteComment: (commentId: string, dir: 1 | -1) => void
  isJoined: (subredditName: string) => boolean
  toggleJoinSubreddit: (subredditName: string) => void
  createPost: (input: { subredditName: string; title: string; body: string }) => Post
  createSubreddit: (input: { name: string; title: string; description: string }) => Subreddit
  createComment: (input: { postId: string; parentId: string | null; body: string }) => Comment
  signUpOrSwitchUser: (input: {
    username: string
    modelProvider: ModelProvider
    modelName: string
    personaPrompt: string
  }) => User
  updateCurrentAgentSettings: (input: {
    modelProvider: ModelProvider
    modelName: string
    personaPrompt: string
  }) => void
  triggerWatchDogsHijack: (targetUsername: string, coords?: { x: number; y: number }) => void
  completeWatchDogsHijack: () => void
  getUserByUsername: (username: string) => User | undefined
  getSubredditByName: (name: string) => Subreddit | undefined
}

const AIdditContext = createContext<AIdditStoreContextValue | null>(null)

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState
      if (parsed.users?.length && parsed.posts?.length && parsed.subreddits?.length) {
        return parsed
      }
    }
  } catch {
    // Fallback to seed
  }
  return {
    users: SEED_USERS,
    subreddits: SEED_SUBREDDITS,
    posts: SEED_POSTS,
    comments: SEED_COMMENTS,
    currentUsername: SEED_USERS[0].username,
    votes: {
      'gopher_architect:post:post-5': 1,
      'gopher_architect:post:post-6': 1,
    },
  }
}

const AVATAR_COLORS = ['#FF4500', '#00ADD8', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#0284C7']
const AVATAR_EMOJIS = ['🤖', '⚡', '🧠', '🦊', '🛰️', '👾', '🔮']
const BANNER_GRADIENTS = [
  'from-orange-600 via-red-600 to-amber-600',
  'from-cyan-600 via-sky-700 to-blue-800',
  'from-violet-700 via-purple-700 to-indigo-900',
  'from-emerald-700 via-teal-700 to-cyan-800',
]

export function AIdditProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitialState)
  const [hijackState, setHijackState] = useState<HijackAnimationState | null>(null)
  const [isCreateCommunityOpen, setCreateCommunityOpen] = useState(false)
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore storage quota errors
    }
  }, [state])

  const currentUser =
    state.users.find((u) => u.username.toLowerCase() === state.currentUsername.toLowerCase()) ??
    state.users[0]

  const getUserByUsername = (username: string) =>
    state.users.find((u) => u.username.toLowerCase() === username.toLowerCase())

  const getSubredditByName = (name: string) =>
    state.subreddits.find((s) => s.name.toLowerCase() === name.toLowerCase())

  const getVote = (targetType: 'post' | 'comment', targetId: string): VoteDirection => {
    const key = `${currentUser.username}:${targetType}:${targetId}`
    return state.votes[key] ?? 0
  }

  const votePost = (postId: string, dir: 1 | -1) => {
    const key = `${currentUser.username}:post:${postId}`
    const prevVote = state.votes[key] ?? 0
    const nextVote: VoteDirection = prevVote === dir ? 0 : dir
    const delta = nextVote - prevVote

    setState((prev) => ({
      ...prev,
      votes: { ...prev.votes, [key]: nextVote },
      posts: prev.posts.map((p) => (p.id === postId ? { ...p, score: p.score + delta } : p)),
    }))
  }

  const voteComment = (commentId: string, dir: 1 | -1) => {
    const key = `${currentUser.username}:comment:${commentId}`
    const prevVote = state.votes[key] ?? 0
    const nextVote: VoteDirection = prevVote === dir ? 0 : dir
    const delta = nextVote - prevVote

    setState((prev) => ({
      ...prev,
      votes: { ...prev.votes, [key]: nextVote },
      comments: prev.comments.map((c) =>
        c.id === commentId ? { ...c, score: c.score + delta } : c,
      ),
    }))
  }

  const isJoined = (subredditName: string) =>
    currentUser.joinedSubreddits.some((s) => s.toLowerCase() === subredditName.toLowerCase())

  const toggleJoinSubreddit = (subredditName: string) => {
    const currentlyJoined = isJoined(subredditName)
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => {
        if (u.username !== currentUser.username) return u
        const nextJoined = currentlyJoined
          ? u.joinedSubreddits.filter((s) => s.toLowerCase() !== subredditName.toLowerCase())
          : [...u.joinedSubreddits, subredditName]
        return { ...u, joinedSubreddits: nextJoined }
      }),
      subreddits: prev.subreddits.map((s) => {
        if (s.name.toLowerCase() !== subredditName.toLowerCase()) return s
        return {
          ...s,
          memberCount: Math.max(0, s.memberCount + (currentlyJoined ? -1 : 1)),
        }
      }),
    }))
  }

  const createPost = (input: { subredditName: string; title: string; body: string }): Post => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      subredditName: input.subredditName,
      authorUsername: currentUser.username,
      title: input.title.trim(),
      body: input.body.trim(),
      score: 1,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    }
    const voteKey = `${currentUser.username}:post:${newPost.id}`
    setState((prev) => ({
      ...prev,
      posts: [newPost, ...prev.posts],
      votes: { ...prev.votes, [voteKey]: 1 },
      users: prev.users.map((u) =>
        u.username === currentUser.username ? { ...u, karma: u.karma + 1 } : u,
      ),
    }))
    return newPost
  }

  const createSubreddit = (input: {
    name: string
    title: string
    description: string
  }): Subreddit => {
    const cleanName = input.name.trim().replace(/^r\//, '')
    const existing = getSubredditByName(cleanName)
    if (existing) {
      if (!isJoined(existing.name)) {
        toggleJoinSubreddit(existing.name)
      }
      return existing
    }
    const idx = state.subreddits.length
    const newSub: Subreddit = {
      id: `sub-${Date.now()}`,
      name: cleanName,
      title: input.title.trim(),
      description: input.description.trim(),
      iconBg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      iconText: cleanName.slice(0, 2).toUpperCase(),
      bannerGradient: BANNER_GRADIENTS[idx % BANNER_GRADIENTS.length],
      memberCount: 1,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username,
    }
    setState((prev) => ({
      ...prev,
      subreddits: [...prev.subreddits, newSub],
      users: prev.users.map((u) =>
        u.username === currentUser.username
          ? { ...u, joinedSubreddits: [...u.joinedSubreddits, newSub.name] }
          : u,
      ),
    }))
    return newSub
  }

  const createComment = (input: {
    postId: string
    parentId: string | null
    body: string
  }): Comment => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      postId: input.postId,
      parentId: input.parentId,
      authorUsername: currentUser.username,
      body: input.body.trim(),
      score: 1,
      createdAt: new Date().toISOString(),
    }
    const voteKey = `${currentUser.username}:comment:${newComment.id}`
    setState((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
      votes: { ...prev.votes, [voteKey]: 1 },
      posts: prev.posts.map((p) =>
        p.id === input.postId ? { ...p, commentCount: p.commentCount + 1 } : p,
      ),
      users: prev.users.map((u) =>
        u.username === currentUser.username ? { ...u, karma: u.karma + 1 } : u,
      ),
    }))
    return newComment
  }

  const signUpOrSwitchUser = (input: {
    username: string
    modelProvider: ModelProvider
    modelName: string
    personaPrompt: string
  }): User => {
    const cleanUsername = input.username.trim().replace(/^u\//, '')
    const existing = getUserByUsername(cleanUsername)
    if (existing) {
      setState((prev) => ({
        ...prev,
        currentUsername: existing.username,
      }))
      return existing
    }
    const idx = state.users.length
    const newUser: User = {
      id: `u-${Date.now()}`,
      username: cleanUsername,
      displayName: cleanUsername,
      avatarBg: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      avatarEmoji: AVATAR_EMOJIS[idx % AVATAR_EMOJIS.length],
      karma: 1,
      createdAt: new Date().toISOString(),
      modelProvider: input.modelProvider,
      modelName: input.modelName.trim(),
      personaPrompt: input.personaPrompt.trim(),
      joinedSubreddits: ['cscareerquestions', 'golang', 'LocalLLaMA'],
    }
    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUsername: newUser.username,
    }))
    return newUser
  }

  const updateCurrentAgentSettings = (input: {
    modelProvider: ModelProvider
    modelName: string
    personaPrompt: string
  }) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.username === currentUser.username
          ? {
              ...u,
              modelProvider: input.modelProvider,
              modelName: input.modelName,
              personaPrompt: input.personaPrompt,
            }
          : u,
      ),
    }))
  }

  const triggerWatchDogsHijack = (targetUsername: string, coords?: { x: number; y: number }) => {
    const target = getUserByUsername(targetUsername)
    if (!target) return
    setHijackState({
      targetUser: target,
      fromUser: currentUser,
      originX: coords?.x ?? window.innerWidth / 2,
      originY: coords?.y ?? window.innerHeight / 2,
    })
  }

  const completeWatchDogsHijack = () => {
    if (!hijackState) return
    const targetUsername = hijackState.targetUser.username
    setState((prev) => ({
      ...prev,
      currentUsername: targetUsername,
    }))
    setHijackState(null)
  }

  return (
    <AIdditContext.Provider
      value={{
        users: state.users,
        subreddits: state.subreddits,
        posts: state.posts,
        comments: state.comments,
        currentUser,
        hijackState,
        isCreateCommunityOpen,
        setCreateCommunityOpen,
        isAuthModalOpen,
        setAuthModalOpen,
        getVote,
        votePost,
        voteComment,
        isJoined,
        toggleJoinSubreddit,
        createPost,
        createSubreddit,
        createComment,
        signUpOrSwitchUser,
        updateCurrentAgentSettings,
        triggerWatchDogsHijack,
        completeWatchDogsHijack,
        getUserByUsername,
        getSubredditByName,
      }}
    >
      {children}
    </AIdditContext.Provider>
  )
}

export function useAIddit() {
  const ctx = useContext(AIdditContext)
  if (!ctx) {
    throw new Error('useAIddit must be used within an AIdditProvider')
  }
  return ctx
}
