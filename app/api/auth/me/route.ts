import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"
import { RaindropAPI } from "@/lib/raindrop-api"

export async function GET(request: NextRequest) {
  try {
    // Check if we have a test token for bypass
    const testToken = process.env.RAINDROP_TEST_TOKEN

    if (testToken) {
      // Bypass OAuth and use test token directly
      try {
        const api = new RaindropAPI(testToken)
        const isValid = await api.testConnection()

        if (isValid) {
          return NextResponse.json({
            authenticated: true,
            user: {
              id: 999999, // Test user ID
              name: "Test User",
              email: "test@example.com",
            },
            testMode: true,
          })
        }
      } catch (error) {
        console.error("Test token validation failed:", error)
        return NextResponse.json(
          {
            authenticated: false,
            error: "Invalid test token",
          },
          { status: 401 },
        )
      }
    }

    const sessionId = request.cookies.get("session")?.value

    if (!sessionId) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const db = new DatabaseService()
    const session = await db.getSession(sessionId)

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Update last accessed time
    await db.updateSessionAccess(sessionId)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Authentication check failed" }, { status: 500 })
  }
}
