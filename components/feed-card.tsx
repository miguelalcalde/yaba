import type { RaindropItem } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Clock, Tag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ProgressIndicator } from "./progress-indicator"

interface FeedCardProps {
  item: RaindropItem
  onProgressUpdate?: (updatedItem: RaindropItem) => void
}

export function FeedCard({ item, onProgressUpdate }: FeedCardProps) {
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

  return (
    <Card className=" border p-4 transition-colors cursor-pointer relative">
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
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
              <h3 className="font-semibold line-clamp-2 text-sm">{item.title || "Untitled"}</h3>
              <ExternalLink className="w-4 h-4  flex-shrink-0" />
            </div>

            {item.excerpt && <p className=" text-sm mt-1 line-clamp-2">{item.excerpt}</p>}

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-3 text-xs ">
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

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                    <Tag className="w-2 h-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </a>

      {/* Progress indicator - positioned outside the link to prevent navigation conflicts */}
      <ProgressIndicator item={item} onProgressUpdate={onProgressUpdate} />
    </Card>
  )
}
