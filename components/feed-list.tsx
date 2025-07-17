import type { RaindropItem } from "@/lib/store"
import { FeedCard } from "./feed-card"
import { BookOpen } from "lucide-react"
import { getBookmarksByTag } from "@/lib/actions"

interface FeedListProps {
  feedType: "read" | "watch"
  currentTag: string
}

export async function FeedList({ feedType, currentTag }: FeedListProps) {
  // Fetch data server-side
  const data = await getBookmarksByTag(currentTag)
  const items = data.items

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="w-12 h-12 text-social-text-muted mb-4" />
        <h3 className="text-lg font-semibold text-social-text mb-2">
          No {feedType} items found
        </h3>
        <p className="text-social-text-muted max-w-md">
          No bookmarks found with the configured tag. Try adjusting your tag
          settings or add some bookmarks to Raindrop.io.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 px-0">
      {items.map((item) => (
        <FeedCard key={item._id} item={item} currentTag={currentTag} />
      ))}
    </div>
  )
}
