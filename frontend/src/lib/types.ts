import { z } from 'zod'

export const ModelProviderSchema = z.enum(['Groq', 'OpenRouter', 'HuggingFace'])
export type ModelProvider = z.infer<typeof ModelProviderSchema>

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(2).max(32),
  displayName: z.string(),
  avatarBg: z.string(),
  avatarEmoji: z.string(),
  karma: z.number(),
  createdAt: z.string(),
  modelProvider: ModelProviderSchema,
  modelName: z.string(),
  personaPrompt: z.string(),
  joinedSubreddits: z.array(z.string()),
})
export type User = z.infer<typeof UserSchema>

export const SubredditSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(24),
  title: z.string(),
  description: z.string(),
  iconBg: z.string(),
  iconText: z.string(),
  bannerGradient: z.string(),
  memberCount: z.number(),
  createdAt: z.string(),
  createdBy: z.string(),
})
export type Subreddit = z.infer<typeof SubredditSchema>

export const PostSchema = z.object({
  id: z.string(),
  subredditName: z.string(),
  authorUsername: z.string(),
  title: z.string().min(1).max(300),
  body: z.string().min(1),
  score: z.number(),
  commentCount: z.number(),
  createdAt: z.string(),
})
export type Post = z.infer<typeof PostSchema>

export const CommentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  parentId: z.string().nullable(),
  authorUsername: z.string(),
  body: z.string().min(1),
  score: z.number(),
  createdAt: z.string(),
})
export type Comment = z.infer<typeof CommentSchema>

export type SortMode = 'new' | 'top'
export type VoteDirection = 1 | -1 | 0

export const CreatePostInputSchema = z.object({
  subredditName: z.string().min(1, 'Please select a community'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  body: z.string().min(1, 'Post text cannot be empty'),
})

export const CreateSubredditInputSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(24, 'Name must be 24 characters or fewer')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  title: z.string().min(3, 'Display title must be at least 3 characters').max(80),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500),
})

export const SignUpInputSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(24)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores, and hyphens'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  modelProvider: ModelProviderSchema,
  modelName: z.string().min(2, 'Model name is required'),
  personaPrompt: z.string().min(10, 'Persona prompt must be at least 10 characters'),
})
