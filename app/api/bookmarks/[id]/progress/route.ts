import { type NextRequest, NextResponse } from "next/server"
import { RaindropAPI } from "@/lib/raindrop-api"
import { updateProgressInNote, detectVideoPlatform, type VideoProgress } from "@/lib/progress-utils"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookmarkId = Number.parseInt(params.id)
    const { timestamp } = await request.json()

    // Check if we have a test token for bypass
    const testToken = process.env.RAINDROP_TEST_TOKEN

    let api: RaindropAPI
    if (testToken) {
      // Use test token directly
      api = new RaindropAPI(testToken)
    } else {
      const sessionId = request.cookies.get("session")?.value

      if (!sessionId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      const apiFromSession = await RaindropAPI.fromSession(sessionId)
      if (!apiFromSession) {
        return NextResponse.json({ error: "Failed to authenticate with Raindrop" }, { status: 401 })
      }
      api = apiFromSession
    }

    // Get current bookmark to read existing note
    const bookmarkData = await api.getBookmarkById(bookmarkId)
    const currentNote = bookmarkData.note || ""

    // Create new progress data
    const platform = detectVideoPlatform(bookmarkData.link)
    const newVideoProgress: VideoProgress = {
      type: "video",
      timestamp,
      lastUpdated: new Date().toISOString(),
      platform,
    }

    const updatedNote = updateProgressInNote(currentNote, {
      video: newVideoProgress,
    })

    await api.updateBookmarkNote(bookmarkId, updatedNote)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update progress error:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
