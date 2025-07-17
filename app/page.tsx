import { checkAuthStatus, getBookmarksByTag } from "@/lib/actions"
import { NavigationTabs } from "@/components/navigation-tabs"
import { FeedList } from "@/components/feed-list"
import { FeedListSkeleton } from "@/components/feed-list-skeleton"
import { Suspense } from "react"

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  // Server-side authentication check
  const authResult = await checkAuthStatus()

  if (!authResult.authenticated) {
    // For unauthenticated users, show the settings dialog
    return (
      <div className="min-h-screen social-container">
        <div className="max-w-2xl mx-auto">
          <NavigationTabs />
          <div className="pb-6">
            <div className="text-center py-8">
              <p className="text-social-text-muted">
                Please sign in with your Raindrop.io account to view your
                bookmarks.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fetch counts for NavigationTabs to render immediately
  const [readData, watchData] = await Promise.all([
    getBookmarksByTag("#read"),
    getBookmarksByTag("#watch"),
  ])

  const currentTab = (params.tab as "read" | "watch") || "read"

  return (
    <div className="min-h-screen social-container">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <NavigationTabs
          activeTab={currentTab}
          readCount={readData.items.length}
          watchCount={watchData.items.length}
        />

        <div className="pb-6">
          {/* Dynamic key triggers immediate skeleton on tab changes */}
          <Suspense key={currentTab} fallback={<FeedListSkeleton />}>
            <FeedList
              feedType={currentTab}
              currentTag={currentTab === "read" ? "#read" : "#watch"}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
