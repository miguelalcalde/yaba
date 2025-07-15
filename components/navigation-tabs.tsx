"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { BookOpen, Play, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationTabsProps {
  onSettingsClick: () => void
}

export function NavigationTabs({ onSettingsClick }: NavigationTabsProps) {
  const { activeTab, setActiveTab, readItems, watchItems } = useAppStore()

  return (
    <div className="sticky top-0  border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-1 text-muted-foreground">
          <Button
            variant={activeTab === "read" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("read")}
            className={cn("flex items-center gap-2", activeTab === "read" && "text-bold text-white")}
          >
            <BookOpen className="w-4 h-4" />
            Read
            {readItems.length > 0 && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{readItems.length}</span>
            )}
          </Button>

          <Button
            variant={activeTab === "watch" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("watch")}
            className={cn("flex items-center gap-2", activeTab === "watch" && "text-bold text-white")}
          >
            <Play className="w-4 h-4" />
            Watch
            {watchItems.length > 0 && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{watchItems.length}</span>
            )}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          className=""
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
