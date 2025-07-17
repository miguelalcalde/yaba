"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExternalLink, MoreVertical, Archive, Trash2 } from "lucide-react"
import { archiveBookmark, deleteBookmark } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useOptimistic } from "react"

interface FeedCardActionsProps {
  itemId: number
  currentTag: string
  raindropUrl: string
}

export function FeedCardActions({
  itemId,
  currentTag,
  raindropUrl,
}: FeedCardActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenInRaindrop = () => {
    window.open(raindropUrl, "_blank", "noopener,noreferrer")
  }

  const handleArchive = () => {
    setIsArchiving(true)
    startTransition(async () => {
      try {
        await archiveBookmark(itemId, currentTag)
        router.refresh()
      } catch (error) {
        console.error("Failed to archive bookmark:", error)
      } finally {
        setIsArchiving(false)
      }
    })
  }

  const handleDelete = () => {
    setIsDeleting(true)
    startTransition(async () => {
      try {
        await deleteBookmark(itemId)
        router.refresh()
      } catch (error) {
        console.error("Failed to delete bookmark:", error)
      } finally {
        setIsDeleting(false)
      }
    })
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {/* Raindrop.io link button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpenInRaindrop}
        className="h-8 w-8 p-0 hover:bg-black/10 dark:hover:bg-white/10"
        title="Open in Raindrop.io"
      >
        <ExternalLink className="w-3 h-3" />
      </Button>

      {/* More actions button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-black/10 dark:hover:bg-white/10"
            disabled={isPending}
          >
            <MoreVertical className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleArchive}
            disabled={isArchiving || isPending}
            className="flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            {isArchiving ? "Archiving..." : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isDeleting || isPending}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
