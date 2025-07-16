"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Play, Clock } from "lucide-react"
import { TimeInputModal } from "./time-input-modal"
import { RaindropAPI } from "@/lib/raindrop-api"
import {
  parseProgressFromNote,
  updateProgressInNote,
  generateResumeUrl,
  detectVideoPlatform,
  formatTimestamp,
  type VideoProgress,
} from "@/lib/progress-utils"
import type { RaindropItem } from "@/lib/store"

interface ProgressIndicatorProps {
  item: RaindropItem
  onProgressUpdate?: (updatedItem: RaindropItem) => void
}

export function ProgressIndicator({ item, onProgressUpdate }: ProgressIndicatorProps) {
  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Show for both video and audio type bookmarks
  if (item.type !== "video" && item.type !== "audio") return null

  const progressData = parseProgressFromNote(item.note)
  const videoProgress = progressData?.video
  const hasProgress = !!videoProgress

  const handleContinueWatching = () => {
    if (!videoProgress) return

    const platform = detectVideoPlatform(item.link)
    const resumeUrl = generateResumeUrl(item.link, videoProgress.timestamp, platform)
    window.open(resumeUrl, "_blank", "noopener,noreferrer")
  }

  const handleSaveProgress = async (timestamp: number) => {
    setIsUpdating(true)
    try {
      // Check if we have a test token for bypass
      const testToken = process.env.NEXT_PUBLIC_RAINDROP_TEST_TOKEN

      let api: RaindropAPI
      if (testToken) {
        // Use test token directly
        api = new RaindropAPI(testToken)
      } else {
        // Use session-based authentication
        const response = await fetch("/api/auth/me")
        if (!response.ok) {
          throw new Error("Not authenticated")
        }

        // We'll need to make this API call through our backend
        // since we can't access session tokens directly in the frontend
        const updateResponse = await fetch(`/api/bookmarks/${item._id}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp }),
        })

        if (!updateResponse.ok) {
          throw new Error("Failed to update progress")
        }

        // Update local state
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

        const updatedItem = { ...item, note: updatedNote }
        onProgressUpdate?.(updatedItem)
        return
      }

      // Direct API call for test mode
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

      await api.updateBookmarkNote(item._id, updatedNote)

      // Update local state
      const updatedItem = { ...item, note: updatedNote }
      onProgressUpdate?.(updatedItem)
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-black/10 dark:hover:bg-white/10">
            {hasProgress ? <Play className="w-3 h-3 fill-current" /> : <Clock className="w-3 h-3" />}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {hasProgress ? (
            <>
              <DropdownMenuItem onClick={handleContinueWatching} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Continue at {formatTimestamp(videoProgress.timestamp)}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeModalOpen(true)} className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Update progress
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setTimeModalOpen(true)} className="flex items-center gap-2">
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
