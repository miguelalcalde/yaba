import { type NextRequest, NextResponse } from "next/server"
import { RaindropAPI } from "@/lib/raindrop-api"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookmarkId = Number.parseInt(params.id)

    // Check if we have a test token for bypass
    const testToken = process.env.RAINDROP_TEST_TOKEN

    if (testToken) {
      // Use test token directly
      const api = new RaindropAPI(testToken)
      await api.deleteBookmark(bookmarkId)
      return NextResponse.json({ success: true })
    }

    const sessionId = request.cookies.get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const api = await RaindropAPI.fromSession(sessionId)
    if (!api) {
      return NextResponse.json({ error: "Failed to authenticate with Raindrop" }, { status: 401 })
    }

    await api.deleteBookmark(bookmarkId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete bookmark error:", error)
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 })
  }
}
