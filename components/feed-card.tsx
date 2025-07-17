"use client"

import type { RaindropItem } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Tag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ProgressIndicator } from "./progress-indicator"
import { FeedCardActions } from "./feed-card-actions"

interface FeedCardProps {
  item: RaindropItem
  currentTag: string
}

export function FeedCard({ item, currentTag }: FeedCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "Unknown date"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return "🎥"
      case "article":
        return "📄"
      case "image":
        return "🖼️"
      case "audio":
        return "🎵"
      default:
        return "🔗"
    }
  }

  const raindropUrl = `https://app.raindrop.io/my/0/item/${item._id}`

  return (
    <Card className="border p-4 transition-colors cursor-pointer relative">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex gap-3">
          {/* Cover image */}
          {item.cover && (
            <div className="flex-shrink-0">
              <img
                src={item.cover || "/placeholder.svg"}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold line-clamp-2 text-sm">
                {item.title || "Untitled"}
              </h3>
            </div>

            {item.excerpt && (
              <p className="text-sm mt-1 line-clamp-2">{item.excerpt}</p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-3 text-xs">
              <div className="flex items-center gap-1">
                <span>{getTypeIcon(item.type)}</span>
                <span className="capitalize">{item.type}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(item.created)}</span>
              </div>

              {item.domain && <span className="truncate">{item.domain}</span>}
            </div>
          </div>
        </div>
      </a>

      {/* Footer with tags and action buttons */}
      <div className="flex items-center justify-between gap-2 mt-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 min-w-0 flex-1">
          {item.tags && item.tags.length > 0 ? (
            <>
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="h-8 text-sm font-light px-2 py-0.5 rounded-sm"
                >
                  <Tag className="w-2 h-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="h-8 text-sm font-light px-2 py-0.5 rounded-sm"
                >
                  +{item.tags.length - 3}
                </Badge>
              )}
            </>
          ) : (
            <div /> // Empty div to maintain layout when no tags
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Progress indicator for videos and audio */}
          {(item.type === "video" || item.type === "audio") && (
            <ProgressIndicator item={item} />
          )}

          <FeedCardActions
            itemId={item._id}
            currentTag={currentTag}
            raindropUrl={raindropUrl}
          />
        </div>
      </div>
    </Card>
  )
}
