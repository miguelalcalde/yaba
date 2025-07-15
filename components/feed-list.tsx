"use client"

import type { RaindropItem } from "@/lib/store"
import { FeedCard } from "./feed-card"
import { Loader2, BookOpen, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"

interface FeedListProps {
  items: RaindropItem[]
  isLoading: boolean
  error: string | null
  feedType: "read" | "watch"
}

export function FeedList({ items, isLoading, error, feedType }: FeedListProps) {
  // Local state to handle progress updates without full refetch
  const [localItems, setLocalItems] = useState<RaindropItem[]>([])

  // Use local items if available, otherwise use props items
  const displayItems = localItems.length > 0 ? localItems : items

  // Update local items when props items change
  if (items !== displayItems && localItems.length === 0) {
    setLocalItems(items)
  }

  const handleProgressUpdate = (updatedItem: RaindropItem) => {
    setLocalItems((prev) => prev.map((item) => (item._id === updatedItem._id ? updatedItem : item)))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 px-0">
        <div className="flex items-center gap-2 text-social-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading {feedType} items...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="mx-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (displayItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="w-12 h-12 text-social-text-muted mb-4" />
        <h3 className="text-lg font-semibold text-social-text mb-2">No {feedType} items found</h3>
        <p className="text-social-text-muted max-w-md">
          No bookmarks found with the configured tag. Try adjusting your tag settings or add some bookmarks to
          Raindrop.io.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 px-0">
      {displayItems.map((item) => (
        <FeedCard key={item._id} item={item} onProgressUpdate={handleProgressUpdate} />
      ))}
    </div>
  )
}
