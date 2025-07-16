import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { DatabaseService } from "@/lib/database"

const RAINDROP_CLIENT_ID = process.env.RAINDROP_CLIENT_ID
const RAINDROP_CLIENT_SECRET = process.env.RAINDROP_CLIENT_SECRET
const RAINDROP_REDIRECT_URI =
  process.env.RAINDROP_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/raindrop/callback`

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  // Check for OAuth errors
  if (error) {
    const errorUrl = new URL("/", request.url)
    errorUrl.searchParams.set("auth_error", error)
    return NextResponse.redirect(errorUrl.toString())
  }

  if (!code || !state) {
    const errorUrl = new URL("/", request.url)
    errorUrl.searchParams.set("auth_error", "missing_parameters")
    return NextResponse.redirect(errorUrl.toString())
  }

  // Verify state parameter
  const storedState = request.cookies.get("oauth_state")?.value
  if (!storedState || storedState !== state) {
    const errorUrl = new URL("/", request.url)
    errorUrl.searchParams.set("auth_error", "invalid_state")
    return NextResponse.redirect(errorUrl.toString())
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://raindrop.io/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: RAINDROP_CLIENT_ID,
        client_secret: RAINDROP_CLIENT_SECRET,
        redirect_uri: RAINDROP_REDIRECT_URI,
        code,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()

    // Get user info from Raindrop API
    const userResponse = await fetch("https://api.raindrop.io/rest/v1/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error(`User info fetch failed: ${userResponse.status}`)
    }

    const userData = await userResponse.json()
    const raindropUser = userData.user

    // Save user and tokens to database
    const db = new DatabaseService()
    const user = await db.createOrUpdateUser(raindropUser._id, raindropUser.email, raindropUser.fullName)

    await db.saveOAuthToken(user.id, tokenData)

    // Create session
    const sessionId = randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await db.createSession(user.id, sessionId, expiresAt)

    // Set session cookie and redirect to app
    const response = NextResponse.redirect(new URL("/", request.url))

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Clear OAuth state cookie
    response.cookies.delete("oauth_state")

    return response
  } catch (error) {
    console.error("OAuth callback error:", error)
    const errorUrl = new URL("/", request.url)
    errorUrl.searchParams.set("auth_error", "callback_failed")
    return NextResponse.redirect(errorUrl.toString())
  }
}
