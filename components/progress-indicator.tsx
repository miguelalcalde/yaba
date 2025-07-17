"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Play, Clock } from "lucide-react"
import { TimeInputModal } from "./time-input-modal"
import { updateBookmarkProgress } from "@/lib/actions"
import {
  parseProgressFromNote,
  updateProgressInNote,
  generateResumeUrl,
  detectVideoPlatform,
  formatTimestamp,
  type VideoProgress,
} from "@/lib/progress-utils"
import type { RaindropItem } from "@/lib/store"
import { useRouter } from "next/navigation"

interface ProgressIndicatorProps {
  item: RaindropItem
}

export function ProgressIndicator({ item }: ProgressIndicatorProps) {
  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  // Show for both video and audio type bookmarks
  if (item.type !== "video" && item.type !== "audio") return null

  const progressData = parseProgressFromNote(item.note)
  const videoProgress = progressData?.video
  const hasProgress = !!videoProgress

  const handleContinueWatching = () => {
    if (!videoProgress) return

    const platform = detectVideoPlatform(item.link)
    const resumeUrl = generateResumeUrl(
      item.link,
      videoProgress.timestamp,
      platform
    )
    window.open(resumeUrl, "_blank", "noopener,noreferrer")
  }

  const handleSaveProgress = async (timestamp: number) => {
    setIsUpdating(true)
    try {
      const platform = detectVideoPlatform(item.link)
      const newVideoProgress: VideoProgress = {
        type: "video",
        timestamp,
        lastUpdated: new Date().toISOString(),
        platform,
      }

      const updatedNote = updateProgressInNote(item.note, {
        video: newVideoProgress,
      })

      await updateBookmarkProgress(item._id, updatedNote)

      // Refresh the page to show updated progress
      router.refresh()
    } catch (error) {
      console.error("Error saving progress:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-black/10 dark:hover:bg-white/10"
            disabled={isUpdating}
          >
            {hasProgress ? (
              <Play className="w-3 h-3 fill-current" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {hasProgress ? (
            <>
              <DropdownMenuItem
                onClick={handleContinueWatching}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Continue at {formatTimestamp(videoProgress.timestamp)}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTimeModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Update progress
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              onClick={() => setTimeModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Save progress
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <TimeInputModal
        open={timeModalOpen}
        onOpenChange={setTimeModalOpen}
        currentTimestamp={videoProgress?.timestamp || 0}
        onSave={handleSaveProgress}
        title={item.title}
      />
    </>
  )
}
