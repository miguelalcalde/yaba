import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"

const RAINDROP_CLIENT_ID = process.env.RAINDROP_CLIENT_ID
const RAINDROP_CLIENT_SECRET = process.env.RAINDROP_CLIENT_SECRET
const RAINDROP_REDIRECT_URI =
  process.env.RAINDROP_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/raindrop/callback`

export async function GET(request: NextRequest) {
  console.log("=== OAuth Route Handler Called ===")
  console.log("Request URL:", request.url)
  console.log("Request method:", request.method)

  try {
    console.log("Environment variables check:")
    console.log("RAINDROP_CLIENT_ID:", RAINDROP_CLIENT_ID ? "✓ Present" : "✗ Missing")
    console.log("RAINDROP_CLIENT_SECRET:", RAINDROP_CLIENT_SECRET ? "✓ Present" : "✗ Missing")
    console.log("NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL)
    console.log("Computed RAINDROP_REDIRECT_URI:", RAINDROP_REDIRECT_URI)

    // Check for missing environment variables
    if (!RAINDROP_CLIENT_ID) {
      console.error("❌ Missing RAINDROP_CLIENT_ID environment variable")
      return NextResponse.json(
        {
          error: "OAuth not configured. Missing RAINDROP_CLIENT_ID.",
          details: "Please add RAINDROP_CLIENT_ID to your environment variables",
        },
        { status: 500 },
      )
    }

    if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.RAINDROP_REDIRECT_URI) {
      console.error("❌ Missing both NEXT_PUBLIC_APP_URL and RAINDROP_REDIRECT_URI")
      return NextResponse.json(
        {
          error: "OAuth not configured. Missing redirect URI configuration.",
          details: "Please add either NEXT_PUBLIC_APP_URL or RAINDROP_REDIRECT_URI to your environment variables",
        },
        { status: 500 },
      )
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

    console.log("Built OAuth URL:", authUrl.toString())
    console.log("OAuth URL components:")
    console.log("- client_id:", RAINDROP_CLIENT_ID)
    console.log("- redirect_uri:", RAINDROP_REDIRECT_URI)
    console.log("- response_type: code")
    console.log("- state:", state)

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

    console.log("✅ Setting oauth_state cookie:", state)
    console.log("✅ Redirecting to Raindrop.io OAuth:", authUrl.toString())

    return response
  } catch (error) {
    console.error("❌ OAuth initiation error:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      name: error instanceof Error ? error.name : "Unknown error type",
    })

    return NextResponse.json(
      {
        error: "Failed to initiate OAuth flow",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
