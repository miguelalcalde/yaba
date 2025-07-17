import { checkAuthStatus, getBookmarksByTag, refreshPage } from "@/lib/actions"
import { NavigationTabs } from "@/components/navigation-tabs"
import { FeedList } from "@/components/feed-list"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { redirect } from "next/navigation"

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

  // Server-side data fetching for authenticated users
  const [readData, watchData] = await Promise.all([
    getBookmarksByTag("#read"),
    getBookmarksByTag("#watch"),
  ])

  const activeTab = (params.tab as "read" | "watch") || "read"
  const currentItems = activeTab === "read" ? readData.items : watchData.items
  const currentTag = activeTab === "read" ? "#read" : "#watch"

  return (
    <div className="min-h-screen social-container">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <NavigationTabs
          activeTab={activeTab}
          readCount={readData.items.length}
          watchCount={watchData.items.length}
        />

        <div className="pb-6">
          <FeedList
            items={currentItems}
            feedType={activeTab}
            currentTag={currentTag}
          />
        </div>
      </div>
    </div>
  )
}
