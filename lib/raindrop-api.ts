import type { RaindropItem } from "./store"
import { DatabaseService } from "./database"

const RAINDROP_API_BASE = "https://api.raindrop.io/rest/v1"

export class RaindropAPI {
  private accessToken: string | null = null

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null
  }

  // Get access token from database using session
  static async fromSession(sessionId: string): Promise<RaindropAPI | null> {
    try {
      const db = new DatabaseService()
      const session = await db.getSession(sessionId)

      if (!session) return null

      const tokenData = await db.getOAuthToken(session.user_id)
      if (!tokenData) return null

      // Check if token is expired and needs refresh
      if (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date()) {
        // Token is expired, attempt refresh
        if (tokenData.refresh_token) {
          const refreshed = await RaindropAPI.refreshToken(tokenData.refresh_token, session.user_id)
          if (refreshed) {
            return new RaindropAPI(refreshed.access_token)
          }
        }
        return null
      }

      return new RaindropAPI(tokenData.access_token)
    } catch (error) {
      console.error("Error creating API from session:", error)
      return null
    }
  }

  // Refresh OAuth token
  static async refreshToken(refreshToken: string, userId: number): Promise<{ access_token: string } | null> {
    try {
      const response = await fetch("https://raindrop.io/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.RAINDROP_CLIENT_ID,
          client_secret: process.env.RAINDROP_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const tokenData = await response.json()

      // Save new token to database
      const db = new DatabaseService()
      await db.saveOAuthToken(userId, tokenData)

      return tokenData
    } catch (error) {
      console.error("Token refresh error:", error)
      return null
    }
  }

  private async makeRequest(endpoint: string, options?: RequestInit): Promise<any> {
    if (!this.accessToken) {
      throw new Error("No access token available")
    }

    const response = await fetch(`${RAINDROP_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`Raindrop API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getBookmarksByTag(tag: string): Promise<RaindropItem[]> {
    try {
      // Remove # from tag if present
      const cleanTag = tag.startsWith("#") ? tag.slice(1) : tag

      // Search for bookmarks with the specified tag
      const data = await this.makeRequest(`/raindrops/0?search=%23${encodeURIComponent(cleanTag)}`)

      return data.items.map((item: any) => ({
        _id: item._id,
        title: item.title,
        excerpt: item.excerpt || "",
        link: item.link,
        domain: item.domain,
        cover: item.cover || "",
        tags: item.tags || [],
        created: item.created,
        type: item.type || "link",
        note: item.note || "",
      }))
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
      throw error
    }
  }

  // New method to get a single bookmark by ID
  async getBookmarkById(bookmarkId: number): Promise<any> {
    try {
      const data = await this.makeRequest(`/raindrop/${bookmarkId}`)
      return data.item
    } catch (error) {
      console.error("Error fetching bookmark:", error)
      throw error
    }
  }

  // New method to update bookmark notes for progress tracking
  async updateBookmarkNote(bookmarkId: number, note: string): Promise<void> {
    try {
      await this.makeRequest(`/raindrop/${bookmarkId}`, {
        method: "PUT",
        body: JSON.stringify({ note }),
      })
    } catch (error) {
      console.error("Error updating bookmark note:", error)
      throw error
    }
  }

  // Archive bookmark by updating tags
  async archiveBookmark(bookmarkId: number, currentTag: string): Promise<void> {
    try {
      const cleanCurrentTag = currentTag.startsWith("#") ? currentTag.slice(1) : currentTag
      const archiveTag = `${cleanCurrentTag}-archive`

      const bookmarkData = await this.makeRequest(`/raindrop/${bookmarkId}`)
      const currentTags = bookmarkData.item.tags || []
      const updatedTags = currentTags.filter((tag: string) => tag !== cleanCurrentTag).concat(archiveTag)

      await this.makeRequest(`/raindrop/${bookmarkId}`, {
        method: "PUT",
        body: JSON.stringify({ tags: updatedTags }),
      })
    } catch (error) {
      console.error("Error archiving bookmark:", error)
      throw error
    }
  }

  // Delete bookmark
  async deleteBookmark(bookmarkId: number): Promise<void> {
    try {
      await this.makeRequest(`/raindrop/${bookmarkId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error deleting bookmark:", error)
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest("/user")
      return true
    } catch (error) {
      return false
    }
  }
}
