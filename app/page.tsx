"use client"

import { useEffect, useState } from "react"
import { useAppStore } from "@/lib/store"
import { RaindropAPI } from "@/lib/raindrop-api"
import { Header } from "@/components/header"
import { NavigationTabs } from "@/components/navigation-tabs"
import { FeedList } from "@/components/feed-list"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function HomePage() {
  const {
    activeTab,
    readTag,
    watchTag,
    raindropToken,
    readItems,
    watchItems,
    isLoading,
    error,
    setReadItems,
    setWatchItems,
    setLoading,
    setError,
  } = useAppStore()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchFeedData = async (forceRefresh = false) => {
    if (!raindropToken) {
      setError("Please configure your Raindrop.io API token in settings")
      return
    }

    // Don't refetch if we have data and it's not a forced refresh
    if (!forceRefresh && (readItems.length > 0 || watchItems.length > 0)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const api = new RaindropAPI(raindropToken)

      const [readData, watchData] = await Promise.all([api.getBookmarksByTag(readTag), api.getBookmarksByTag(watchTag)])

      setReadItems(readData)
      setWatchItems(watchData)
      setLastRefresh(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch bookmarks"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchFeedData(true)
  }

  // Initial data fetch
  useEffect(() => {
    fetchFeedData()
  }, [raindropToken, readTag, watchTag])

  // Show settings dialog if no token is configured
  useEffect(() => {
    if (!raindropToken) {
      setSettingsOpen(true)
    }
  }, [raindropToken])

  const currentItems = activeTab === "read" ? readItems : watchItems

  return (
    <div className="min-h-screen social-container">
      <Header />

      <div className="max-w-2xl mx-auto">
        <NavigationTabs onSettingsClick={() => setSettingsOpen(true)} />

        {/* Refresh button */}
        <div className="flex justify-between items-center px-4 py-3 social-border border-b-0">
          <div className="text-sm text-social-text-muted">
            {lastRefresh && <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-social-text-muted hover:text-social-text"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="pb-6">
          <FeedList items={currentItems} isLoading={isLoading} error={error} feedType={activeTab} />
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
