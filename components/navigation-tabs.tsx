import { Button } from "@/components/ui/button"
import { BookOpen, Play, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { SettingsDialog } from "./settings-dialog"
import { refreshPage } from "@/lib/actions"

interface NavigationTabsProps {
  activeTab?: "read" | "watch"
  readCount?: number
  watchCount?: number
}

export function NavigationTabs({
  activeTab = "read",
  readCount = 0,
  watchCount = 0,
}: NavigationTabsProps) {
  return (
    <>
      <div className="sticky top-0 border border-t-0 bg-background/80 backdrop-blur-md z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Link href="/?tab=read">
              <Button
                variant={activeTab === "read" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center gap-2",
                  activeTab === "read" && "text-bold text-white"
                )}
              >
                <BookOpen className="w-4 h-4" />
                Read
                {readCount > 0 && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {readCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/?tab=watch">
              <Button
                variant={activeTab === "watch" ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "flex items-center gap-2",
                  activeTab === "watch" && "text-bold text-white"
                )}
              >
                <Play className="w-4 h-4" />
                Watch
                {watchCount > 0 && (
                  <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                    {watchCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <form action={refreshPage}>
              <input type="hidden" name="tab" value={activeTab} />
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-social-text-muted hover:text-social-text"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </form>
            <SettingsDialog />
          </div>
        </div>
      </div>
    </>
  )
}
