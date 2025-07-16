import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

// Debug logging
console.log("Raindrop auth route loaded")
console.log("RAINDROP_CLIENT_ID exists:", !!process.env.RAINDROP_CLIENT_ID)
console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL)

const RAINDROP_CLIENT_ID = process.env.RAINDROP_CLIENT_ID
const RAINDROP_CLIENT_SECRET = process.env.RAINDROP_CLIENT_SECRET
const RAINDROP_REDIRECT_URI =
  process.env.RAINDROP_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/raindrop/callback`

export async function GET(request: NextRequest) {
  console.log("GET /api/auth/raindrop called")

  try {
    if (!RAINDROP_CLIENT_ID) {
      console.error("Missing RAINDROP_CLIENT_ID")
      return NextResponse.json({ error: "OAuth not configured. Missing RAINDROP_CLIENT_ID." }, { status: 500 })
    }

    // Generate state parameter for CSRF protection
    const state = randomBytes(32).toString("hex")
    console.log("Generated state:", state)

    // Build OAuth authorization URL
    const authUrl = new URL("https://raindrop.io/oauth/authorize")
    authUrl.searchParams.set("client_id", RAINDROP_CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", RAINDROP_REDIRECT_URI)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("state", state)

    console.log("Redirect URI:", RAINDROP_REDIRECT_URI)
    console.log("Auth URL:", authUrl.toString())

    // Create response with redirect
    const response = NextResponse.redirect(authUrl.toString())

    // Store state in HTTP-only cookie for verification
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    })

    return response
  } catch (error) {
    console.error("OAuth initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate OAuth flow" }, { status: 500 })
  }
}
