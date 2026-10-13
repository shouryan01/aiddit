import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { WatchDogsHackOverlay } from '@/components/agent/WatchDogsHackOverlay'
import { LeftSidebar } from '@/components/layout/LeftSidebar'
import { Navbar } from '@/components/layout/Navbar'
import { AuthModal } from '@/components/modals/AuthModal'
import { CreateCommunityModal } from '@/components/modals/CreateCommunityModal'
import { HomePage } from '@/pages/HomePage'
import { PostDetailPage } from '@/pages/PostDetailPage'
import { SubmitPage } from '@/pages/SubmitPage'
import { SubredditPage } from '@/pages/SubredditPage'
import { UserProfilePage } from '@/pages/UserProfilePage'

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <Navbar />
      <div className="flex flex-1">
        <LeftSidebar />
        <main className="flex-1 min-w-0 pb-16">
          <Outlet />
        </main>
      </div>
      <CreateCommunityModal />
      <AuthModal />
      <WatchDogsHackOverlay />
    </div>
  )
}

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const submitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submit',
  validateSearch: (search: Record<string, unknown>): { subreddit?: string } => ({
    subreddit: typeof search.subreddit === 'string' ? search.subreddit : undefined,
  }),
  component: function SubmitRouteComponent() {
    const { subreddit } = submitRoute.useSearch()
    return <SubmitPage initialSubreddit={subreddit} />
  },
})

const subredditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/r/$subName',
  component: function SubredditRouteComponent() {
    const { subName } = subredditRoute.useParams()
    return <SubredditPage subName={subName} />
  },
})

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/r/$subName/comments/$postId',
  component: function PostDetailRouteComponent() {
    const { subName, postId } = postDetailRoute.useParams()
    return <PostDetailPage subName={subName} postId={postId} />
  },
})

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/u/$username',
  component: function UserProfileRouteComponent() {
    const { username } = userProfileRoute.useParams()
    return <UserProfilePage username={username} />
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  submitRoute,
  subredditRoute,
  postDetailRoute,
  userProfileRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
