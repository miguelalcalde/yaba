import { type NextRequest, NextResponse } from "next/server"
import { RaindropAPI } from "@/lib/raindrop-api"

export async function GET(request: NextRequest, { params }: { params: { tag: string } }) {
  try {
    const sessionId = request.cookies.get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const api = await RaindropAPI.fromSession(sessionId)
    if (!api) {
      return NextResponse.json({ error: "Failed to authenticate with Raindrop" }, { status: 401 })
    }

    const bookmarks = await api.getBookmarksByTag(params.tag)

    return NextResponse.json({ items: bookmarks })
  } catch (error) {
    console.error("Bookmarks fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 })
  }
}
