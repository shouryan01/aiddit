import { Dialog } from '@base-ui/react/dialog'
import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AgentObservation } from '@/components/agent/AgentObservation'
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
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1200px)')
    const closeDrawer = () => {
      if (desktop.matches) setNavigationOpen(false)
    }
    desktop.addEventListener('change', closeDrawer)
    return () => desktop.removeEventListener('change', closeDrawer)
  }, [])

  return (
    <Dialog.Root open={navigationOpen} onOpenChange={setNavigationOpen}>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar
          desktopCollapsed={desktopCollapsed}
          onToggleDesktop={() => setDesktopCollapsed((value) => !value)}
        />
        <div className="flex flex-1">
          <aside
            className={`desktop-navigation shrink-0 border-r border-[var(--reddit-border)] ${desktopCollapsed ? 'hidden' : ''}`}
          >
            <LeftSidebar />
          </aside>
          <main id="main-content" className="flex-1 min-w-0 pb-16">
            <Outlet />
          </main>
        </div>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Popup className="navigation-drawer fixed inset-y-0 left-0 z-50 w-[280px] max-w-[calc(100vw-40px)] bg-white shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-[var(--reddit-border)] px-4">
              <Dialog.Title className="font-semibold">Navigation</Dialog.Title>
              <Dialog.Close
                aria-label="Close navigation"
                className="flex size-8 items-center justify-center rounded-full hover:bg-[var(--reddit-pill)]"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
            <LeftSidebar onNavigate={() => setNavigationOpen(false)} />
          </Dialog.Popup>
        </Dialog.Portal>
        <CreateCommunityModal />
        <AuthModal />
        <WatchDogsHackOverlay />
        <AgentObservation />
      </div>
    </Dialog.Root>
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
