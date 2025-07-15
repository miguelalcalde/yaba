import { Bookmark } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 social-card border-b social-border">
      <div className="flex items-center justify-center px-4 py-4 bg-white ">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-xl font-bold text-social-text">Bookmark feed
</h1>
            <p className="text-xs text-social-text-muted">Your curated content feeds</p>
          </div>
        </div>
      </div>
    </header>
  )
}
